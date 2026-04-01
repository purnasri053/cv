package com.cvscanner.controller;

import com.cvscanner.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobDescription") String jobDescription) {

        if (resume.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "No resume file uploaded"));
        if (jobDescription == null || jobDescription.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Job description is required"));

        try {
            String resumeText = resumeService.extractText(resume);
            List<String> extractedSkills = resumeService.extractSkills(resumeText);
            List<String> requiredSkills  = resumeService.extractSkills(jobDescription);
            List<String> missingSkills   = requiredSkills.stream()
                    .filter(s -> !extractedSkills.contains(s)).collect(Collectors.toList());
            int matchScore = resumeService.calcMatchScore(requiredSkills, extractedSkills);
            String candidateName = resumeService.candidateNameFromFilename(
                    Objects.requireNonNull(resume.getOriginalFilename()));

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Resume uploaded and analyzed successfully");
            response.put("fileName", resume.getOriginalFilename());
            response.put("candidateName", candidateName);
            response.put("extractedSkills", extractedSkills);
            response.put("requiredSkills", requiredSkills);
            response.put("missingSkills", missingSkills);
            response.put("matchScore", matchScore);
            response.put("rankedCandidates", List.of(Map.of("name", candidateName, "score", matchScore)));
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/analyze-multiple")
    public ResponseEntity<?> analyzeMultiple(
            @RequestParam("resumes") List<MultipartFile> resumes,
            @RequestParam("jobDescription") String jobDescription,
            @RequestParam(value = "shortlistCount", defaultValue = "5") int shortlistCount) {

        if (resumes == null || resumes.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "No resumes uploaded"));
        if (jobDescription == null || jobDescription.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Job description is required"));

        try {
            List<String> requiredSkills = resumeService.extractSkills(jobDescription);
            List<Map<String, Object>> allResults = new ArrayList<>();

            for (MultipartFile resume : resumes) {
                if (resume.isEmpty()) continue;
                String filename = Objects.requireNonNull(resume.getOriginalFilename());
                if (!filename.toLowerCase().endsWith(".pdf") && !filename.toLowerCase().endsWith(".docx")) continue;

                List<String> extractedSkills = resumeService.extractSkills(resumeService.extractText(resume));
                List<String> missingSkills = requiredSkills.stream()
                        .filter(s -> !extractedSkills.contains(s)).collect(Collectors.toList());
                int score = resumeService.calcMatchScore(requiredSkills, extractedSkills);
                String name = resumeService.candidateNameFromFilename(filename);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("name", name); result.put("score", score);
                result.put("extractedSkills", extractedSkills); result.put("missingSkills", missingSkills);
                allResults.add(result);
            }

            allResults.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));
            List<Map<String, Object>> ranked = allResults.stream()
                    .map(r -> Map.of("name", r.get("name"), "score", r.get("score")))
                    .collect(Collectors.toList());

            Map<String, Object> top = allResults.isEmpty()
                    ? Map.of("name","N/A","score",0,"extractedSkills",List.of(),"missingSkills",List.of())
                    : allResults.get(0);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Resumes analyzed successfully");
            response.put("requiredSkills", requiredSkills);
            response.put("rankedCandidates", ranked);
            response.put("allResults", allResults);
            response.put("shortlistCount", shortlistCount);
            response.put("extractedSkills", top.get("extractedSkills"));
            response.put("missingSkills", top.get("missingSkills"));
            response.put("matchScore", top.get("score"));
            response.put("candidateName", top.get("name"));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/test-db")
    public ResponseEntity<String> testDb() {
        return ResponseEntity.ok("Database connected successfully!");
    }
}
