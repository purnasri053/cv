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
        // Software / Web Development
        ROLE_SKILLS.put("software developer", List.of("Java", "Python", "JavaScript", "Git", "Sql", "Rest Api", "Problem Solving", "Data Structures"));
        ROLE_SKILLS.put("software engineer", List.of("Java", "Python", "JavaScript", "Git", "Sql", "Rest Api", "System Design", "Problem Solving", "Data Structures"));
        ROLE_SKILLS.put("full stack developer", List.of("React", "Node.Js", "JavaScript", "Html", "Css", "Sql", "Mongodb", "Git", "Rest Api", "Docker"));
        ROLE_SKILLS.put("frontend developer", List.of("Html", "Css", "JavaScript", "React", "TypeScript", "Git", "Responsive Design"));
        ROLE_SKILLS.put("backend developer", List.of("Java", "Python", "Node.Js", "Sql", "Rest Api", "Docker", "Git", "Microservices"));
        ROLE_SKILLS.put("web developer", List.of("Html", "Css", "JavaScript", "React", "Node.Js", "Git", "Sql"));
        ROLE_SKILLS.put("java developer", List.of("Java", "Spring Boot", "Hibernate", "Sql", "Rest Api", "Git", "Maven", "Microservices"));
        ROLE_SKILLS.put("python developer", List.of("Python", "Django", "Flask", "Sql", "Rest Api", "Git", "Docker"));
        ROLE_SKILLS.put("react developer", List.of("React", "JavaScript", "Html", "Css", "Git", "Rest Api", "TypeScript", "Redux"));
        ROLE_SKILLS.put("node developer", List.of("Node.Js", "JavaScript", "Express", "Mongodb", "Rest Api", "Git", "Docker"));

        // Data / AI / ML
        ROLE_SKILLS.put("data scientist", List.of("Python", "Machine Learning", "Deep Learning", "Pandas", "Numpy", "Sql", "Data Analysis", "TensorFlow", "Statistics"));
        ROLE_SKILLS.put("data analyst", List.of("Python", "Sql", "Excel", "Power Bi", "Tableau", "Data Analysis", "Pandas", "Statistics"));
        ROLE_SKILLS.put("machine learning engineer", List.of("Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Nlp", "Sql", "Docker"));
        ROLE_SKILLS.put("ai engineer", List.of("Python", "Machine Learning", "Deep Learning", "Nlp", "Computer Vision", "TensorFlow", "PyTorch", "Docker"));
        ROLE_SKILLS.put("data engineer", List.of("Python", "Sql", "Spark", "Hadoop", "Aws", "Docker", "Airflow", "Data Pipelines"));
        ROLE_SKILLS.put("business analyst", List.of("Sql", "Excel", "Power Bi", "Data Analysis", "Communication", "Agile", "Requirements Gathering"));

        // DevOps / Cloud
        ROLE_SKILLS.put("devops engineer", List.of("Docker", "Kubernetes", "Aws", "Linux", "Git", "Ci/Cd", "Jenkins", "Python", "Terraform"));
        ROLE_SKILLS.put("cloud engineer", List.of("Aws", "Azure", "Gcp", "Docker", "Kubernetes", "Linux", "Python", "Terraform", "Networking"));
        ROLE_SKILLS.put("site reliability engineer", List.of("Linux", "Docker", "Kubernetes", "Python", "Monitoring", "Aws", "Git", "Ci/Cd"));

        // VLSI / Electronics
        ROLE_SKILLS.put("vlsi engineer", List.of("Verilog", "Vhdl", "Vlsi", "Fpga", "Cadence", "Synopsys", "Spice", "Matlab", "Digital Design"));
        ROLE_SKILLS.put("vlsi design", List.of("Verilog", "Vhdl", "Vlsi", "Fpga", "Cadence", "Synopsys", "Spice", "Ltspice", "Digital Design"));
        ROLE_SKILLS.put("vlsi", List.of("Verilog", "Vhdl", "Vlsi", "Fpga", "Cadence", "Synopsys", "Spice", "Digital Design", "Matlab"));
        ROLE_SKILLS.put("chip design", List.of("Verilog", "Vhdl", "Vlsi", "Cadence", "Synopsys", "Spice", "Digital Design"));
        ROLE_SKILLS.put("rtl design", List.of("Verilog", "Vhdl", "Fpga", "Cadence", "Digital Design", "Timing Analysis"));

        // Embedded Systems
        ROLE_SKILLS.put("embedded systems engineer", List.of("C", "C++", "Embedded Systems", "Arduino", "Rtos", "Arm", "Uart", "Spi", "I2C", "Matlab"));
        ROLE_SKILLS.put("embedded developer", List.of("C", "C++", "Embedded Systems", "Rtos", "Arm", "Git", "Linux", "Microcontrollers"));
        ROLE_SKILLS.put("iot engineer", List.of("C", "C++", "Embedded Systems", "Arduino", "Raspberry Pi", "Mqtt", "Python", "Networking"));

        // Mobile
        ROLE_SKILLS.put("android developer", List.of("Android", "Java", "Kotlin", "Git", "Rest Api", "Sql", "Firebase"));
        ROLE_SKILLS.put("ios developer", List.of("Ios", "Swift", "Git", "Rest Api", "Xcode", "Firebase"));
        ROLE_SKILLS.put("mobile developer", List.of("Flutter", "React Native", "Android", "Ios", "JavaScript", "Git", "Rest Api"));
        ROLE_SKILLS.put("flutter developer", List.of("Flutter", "Dart", "Android", "Ios", "Git", "Rest Api", "Firebase"));

        // Cybersecurity
        ROLE_SKILLS.put("cybersecurity engineer", List.of("Cybersecurity", "Ethical Hacking", "Penetration Testing", "Networking", "Tcp/Ip", "Linux", "Python"));
        ROLE_SKILLS.put("security analyst", List.of("Cybersecurity", "Networking", "Linux", "Python", "Siem", "Incident Response"));
        ROLE_SKILLS.put("network engineer", List.of("Networking", "Tcp/Ip", "Linux", "Cybersecurity", "Aws", "Routing", "Switching"));

        // Other roles
        ROLE_SKILLS.put("database administrator", List.of("Sql", "Mysql", "Postgresql", "Mongodb", "Redis", "Python", "Linux", "Backup Recovery"));
        ROLE_SKILLS.put("product manager", List.of("Agile", "Scrum", "Communication", "Leadership", "Problem Solving", "Data Analysis", "Roadmapping"));
        ROLE_SKILLS.put("ui ux designer", List.of("Html", "Css", "JavaScript", "Figma", "Communication", "Problem Solving", "Prototyping"));
        ROLE_SKILLS.put("qa engineer", List.of("Testing", "Selenium", "Java", "Python", "Sql", "Git", "Agile", "Api Testing"));
        ROLE_SKILLS.put("scrum master", List.of("Agile", "Scrum", "Communication", "Leadership", "Jira", "Problem Solving"));
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
            return roleSkills; // already title-cased in the map
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
