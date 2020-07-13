package com.pipenetwork.graph.controller;
import com.pipenetwork.graph.bean.UserBean;
import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class LoginController {

    //将Service注入Web层
    @Autowired
    UserService userService;


    @RequestMapping("/login")
    public String show(){
        return "login";
    }

    @RequestMapping(value = "/loginIn",method = RequestMethod.POST)
    public String login(String name,String password){
        UserBean userBean = userService.loginIn(name,password);
        if(userBean!=null){
            if(userBean.getRole()==1)
                return "administator";
            else
                return "user";
        }else {
            return "error";
        }
    }

    @RequestMapping("/graph")
    public String showGraph (){
        return "graph";
    }



}