package com.pipenetwork.graph.controller;

import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;

public class AdminController {

    //将Service注入Web层
    @Autowired
    UserService userService;


}
