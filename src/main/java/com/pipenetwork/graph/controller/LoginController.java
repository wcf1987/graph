package com.pipenetwork.graph.controller;
import com.pipenetwork.graph.bean.UserBean;
import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.JsonObjectSerializer;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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

    @RequestMapping("/graph/getElements")
    @ResponseBody
    public String getElements(){
        String test = "{\"code\":\"0\",\"elements\":[{\"id\":\"1\",\"name\":\"分输站\",\"path\":\"/elements/分输站.svg\"},{\"id\":\"2\",\"name\":\"单向阀\",\"path\":\"/elements/单向阀.svg\"},{\"id\":\"3\",\"name\":\"截断阀\",\"path\":\"/elements/截断阀.svg\"},{\"id\":\"13\",\"name\":\"阀室\",\"path\":\"/elements/阀室.svg\"}]}";
        return test;
    }



}