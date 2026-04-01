package com.cvscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CvScannerApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CvScannerApplication.class);
        app.setLazyInitialization(true);
        app.run(args);
    }
}
