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

    private static final List<String> SKILL_KEYWORDS = List.of(
        "python", "html", "css", "javascript", "react", "react js",
        "node.js", "node", "mongodb", "mongo", "sql", "mysql",
        "flask", "java", "c", "c++", "machine learning",
        "deep learning", "nlp", "data analysis", "excel",
        "power bi", "communication", "problem solving",
        "spring", "spring boot", "hibernate", "rest api",
        "docker", "kubernetes", "git", "aws", "linux"
    );

    public String extractText(MultipartFile file) throws IOException {
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
        if (filename.endsWith(".pdf")) {
            return extractFromPdf(file.getInputStream());
        } else if (filename.endsWith(".docx")) {
            return extractFromDocx(file.getInputStream());
        }
        throw new IllegalArgumentException("Unsupported file type. Upload PDF or DOCX only.");
    }

    private String extractFromPdf(InputStream is) throws IOException {
        byte[] bytes = is.readAllBytes();
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractFromDocx(InputStream is) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(is)) {
            return doc.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
        }
    }

    public List<String> extractSkills(String text) {
        String lower = text.toLowerCase();
        Set<String> found = new LinkedHashSet<>();
        for (String skill : SKILL_KEYWORDS) {
            if (lower.contains(skill)) {
                // Title-case the skill
                String titled = Arrays.stream(skill.split(" "))
                        .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))
                        .collect(Collectors.joining(" "));
                found.add(titled);
            }
        }
        return new ArrayList<>(found);
    }

    public int calcMatchScore(List<String> required, List<String> extracted) {
        if (required.isEmpty()) return 0;
        long matched = required.stream().filter(extracted::contains).count();
        return (int) ((matched * 100) / required.size());
    }

    public String candidateNameFromFilename(String filename) {
        // Remove extension
        String name = filename.contains(".") ? filename.substring(0, filename.lastIndexOf('.')) : filename;
        // Replace separators
        name = name.replace("_", " ").replace("-", " ").trim();
        // If it looks like a UUID or hash (long alphanumeric with no spaces), label it generically
        if (name.replaceAll("[^a-zA-Z]", "").length() < 3 || name.matches("[a-f0-9 ]{30,}")) {
            return "Candidate (" + filename + ")";
        }
        // Title case each word
        String[] words = name.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)));
                sb.append(w.substring(1).toLowerCase());
                sb.append(" ");
            }
        }
        return sb.toString().trim();
    }
}
