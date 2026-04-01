package com.cvscanner.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    // ── All detectable skills ──────────────────────────────────────────────
    private static final List<String> SKILL_KEYWORDS = List.of(
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust", "kotlin", "swift",
        "html", "css", "react", "angular", "vue", "node.js", "node", "express",
        "spring", "spring boot", "hibernate", "django", "flask", "fastapi",
        "sql", "mysql", "postgresql", "mongodb", "redis", "firebase",
        "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
        "data analysis", "data science", "pandas", "numpy", "matplotlib", "tableau", "power bi", "excel",
        "docker", "kubernetes", "aws", "azure", "gcp", "linux", "git", "ci/cd", "jenkins",
        "rest api", "graphql", "microservices", "system design",
        "verilog", "vhdl", "vlsi", "fpga", "cadence", "synopsys", "spice", "ltspice",
        "embedded systems", "arduino", "raspberry pi", "rtos", "arm", "uart", "spi", "i2c",
        "matlab", "simulink", "labview",
        "networking", "tcp/ip", "cybersecurity", "ethical hacking", "penetration testing",
        "android", "ios", "flutter", "react native",
        "communication", "problem solving", "teamwork", "leadership", "agile", "scrum"
    );

    // ── Job role → required skills mapping ────────────────────────────────
    private static final Map<String, List<String>> ROLE_SKILLS = new LinkedHashMap<>();

    static {
        ROLE_SKILLS.put("software developer", List.of("java", "python", "javascript", "git", "sql", "rest api", "problem solving"));
        ROLE_SKILLS.put("software engineer", List.of("java", "python", "javascript", "git", "sql", "rest api", "system design", "problem solving"));
        ROLE_SKILLS.put("full stack developer", List.of("react", "node.js", "javascript", "html", "css", "sql", "mongodb", "git", "rest api"));
        ROLE_SKILLS.put("frontend developer", List.of("html", "css", "javascript", "react", "typescript", "git"));
        ROLE_SKILLS.put("backend developer", List.of("java", "python", "node.js", "sql", "rest api", "docker", "git"));
        ROLE_SKILLS.put("data scientist", List.of("python", "machine learning", "deep learning", "pandas", "numpy", "sql", "data analysis", "tensorflow"));
        ROLE_SKILLS.put("data analyst", List.of("python", "sql", "excel", "power bi", "tableau", "data analysis", "pandas"));
        ROLE_SKILLS.put("machine learning engineer", List.of("python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "nlp", "sql"));
        ROLE_SKILLS.put("ai engineer", List.of("python", "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch"));
        ROLE_SKILLS.put("devops engineer", List.of("docker", "kubernetes", "aws", "linux", "git", "ci/cd", "jenkins", "python"));
        ROLE_SKILLS.put("cloud engineer", List.of("aws", "azure", "gcp", "docker", "kubernetes", "linux", "python", "terraform"));
        ROLE_SKILLS.put("android developer", List.of("android", "java", "kotlin", "git", "rest api", "sql"));
        ROLE_SKILLS.put("ios developer", List.of("ios", "swift", "git", "rest api", "xcode"));
        ROLE_SKILLS.put("mobile developer", List.of("flutter", "react native", "android", "ios", "javascript", "git"));
        ROLE_SKILLS.put("vlsi engineer", List.of("verilog", "vhdl", "vlsi", "fpga", "cadence", "synopsys", "spice", "matlab"));
        ROLE_SKILLS.put("vlsi design", List.of("verilog", "vhdl", "vlsi", "fpga", "cadence", "synopsys", "spice", "ltspice"));
        ROLE_SKILLS.put("embedded systems engineer", List.of("c", "c++", "embedded systems", "arduino", "rtos", "arm", "uart", "spi", "i2c", "matlab"));
        ROLE_SKILLS.put("embedded developer", List.of("c", "c++", "embedded systems", "rtos", "arm", "git", "linux"));
        ROLE_SKILLS.put("cybersecurity engineer", List.of("cybersecurity", "ethical hacking", "penetration testing", "networking", "tcp/ip", "linux", "python"));
        ROLE_SKILLS.put("network engineer", List.of("networking", "tcp/ip", "linux", "cybersecurity", "aws"));
        ROLE_SKILLS.put("java developer", List.of("java", "spring boot", "hibernate", "sql", "rest api", "git", "maven"));
        ROLE_SKILLS.put("python developer", List.of("python", "django", "flask", "sql", "rest api", "git", "docker"));
        ROLE_SKILLS.put("react developer", List.of("react", "javascript", "html", "css", "git", "rest api", "typescript"));
        ROLE_SKILLS.put("database administrator", List.of("sql", "mysql", "postgresql", "mongodb", "redis", "python", "linux"));
        ROLE_SKILLS.put("ui ux designer", List.of("html", "css", "javascript", "figma", "communication", "problem solving"));
        ROLE_SKILLS.put("product manager", List.of("agile", "scrum", "communication", "leadership", "problem solving", "data analysis"));
        ROLE_SKILLS.put("business analyst", List.of("sql", "excel", "power bi", "data analysis", "communication", "agile"));
    }

    // ── Extract text from uploaded file ───────────────────────────────────
    public String extractText(MultipartFile file) throws IOException {
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
        if (filename.endsWith(".pdf"))  return extractFromPdf(file.getInputStream());
        if (filename.endsWith(".docx")) return extractFromDocx(file.getInputStream());
        throw new IllegalArgumentException("Unsupported file type. Upload PDF or DOCX only.");
    }

    private String extractFromPdf(InputStream is) throws IOException {
        byte[] bytes = is.readAllBytes();
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            return new PDFTextStripper().getText(doc);
        }
    }

    private String extractFromDocx(InputStream is) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(is)) {
            return doc.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
        }
    }

    // ── Extract skills from text ───────────────────────────────────────────
    // If the input is a short job role name, expand it using the role map first
    public List<String> extractSkills(String text) {
        String lower = text.toLowerCase().trim();

        // Check if input matches a known job role (short input like "software developer")
        List<String> roleSkills = getRoleSkills(lower);
        if (roleSkills != null && !roleSkills.isEmpty()) {
            return titleCase(roleSkills);
        }

        // Otherwise do keyword extraction from full text
        Set<String> found = new LinkedHashSet<>();
        for (String skill : SKILL_KEYWORDS) {
            if (lower.contains(skill)) {
                found.add(skill);
            }
        }
        return titleCase(new ArrayList<>(found));
    }

    // Find best matching role from the map
    private List<String> getRoleSkills(String input) {
        // Exact match first
        if (ROLE_SKILLS.containsKey(input)) return ROLE_SKILLS.get(input);

        // Partial match — find role whose key is contained in input or vice versa
        for (Map.Entry<String, List<String>> entry : ROLE_SKILLS.entrySet()) {
            if (input.contains(entry.getKey()) || entry.getKey().contains(input)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private List<String> titleCase(List<String> skills) {
        return skills.stream().map(skill ->
            Arrays.stream(skill.split(" "))
                .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "))
        ).collect(Collectors.toList());
    }

    public int calcMatchScore(List<String> required, List<String> extracted) {
        if (required.isEmpty()) return 0;
        long matched = required.stream().filter(extracted::contains).count();
        return (int) ((matched * 100) / required.size());
    }

    public String candidateNameFromFilename(String filename) {
        String name = filename.contains(".") ? filename.substring(0, filename.lastIndexOf('.')) : filename;
        name = name.replace("_", " ").replace("-", " ").trim();
        if (name.replaceAll("[^a-zA-Z]", "").length() < 3 || name.matches("[a-f0-9 ]{30,}")) {
            return "Candidate (" + filename + ")";
        }
        return Arrays.stream(name.split("\\s+"))
                .filter(w -> !w.isEmpty())
                .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}
