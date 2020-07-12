package com.pipenetwork.graph;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.pipenetwork.graph.mapper")
public class GraphApplication {
    public static void main(String[] args) {
        SpringApplication.run(GraphApplication.class, args);
    }

}
