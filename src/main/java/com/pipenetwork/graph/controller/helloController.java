package com.pipenetwork.graph.controller;
import com.pipenetwork.graph.bean.UserBean;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class helloController {
    @RequestMapping("/index")
    public String sayHello(){
        return "index";
    }


}
