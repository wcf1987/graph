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

    //下面两个方法仅为测试使用！未实现完成！
    @RequestMapping("/graph/getElements")
    @ResponseBody
    public String getElements(){
        String test = "{\"code\":\"0\",\"elements\":[{\"id\":\"1\",\"name\":\"分输站\",\"path\":\"/elements/分输站.svg\"},{\"id\":\"2\",\"name\":\"单向阀\",\"path\":\"/elements/单向阀.svg\"},{\"id\":\"3\",\"name\":\"截断阀\",\"path\":\"/elements/截断阀.svg\"},{\"id\":\"13\",\"name\":\"阀室\",\"path\":\"/elements/阀室.svg\"}]}";
        return test;
    }

    @RequestMapping("/graph/getAttributes")
    @ResponseBody
    public String getAttributes(String id){
        String test = "{\"code\":\"0\",\"attributes\":[{\"id\":\"1\",\"name\":\"流速\",\"value\":\"123\"},{\"id\":\"2\",\"name\":\"长度\",\"value\":\"321\"},{\"id\":\"3\",\"name\":\"方向\",\"value\":\"西北\"},{\"id\":\"4\",\"name\":\"高度\",\"value\":\"111\"}]}";
        return test;
    }



}