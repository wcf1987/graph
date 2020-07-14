package com.pipenetwork.graph.controller;
import com.pipenetwork.graph.bean.ElementBean;
import com.pipenetwork.graph.bean.UserBean;
import com.pipenetwork.graph.mapper.ElementMapper;
import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class LoginController {

    //将Service注入Web层
    @Autowired
    UserService userService;
    @Autowired
    ElementMapper elementMapper;


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

    @RequestMapping(value = "/graph",method = RequestMethod.GET)
    public String showGraph (){
        //ElementBean elementBean
        return "graph";
    }

    //下面两个方法仅为测试使用！未实现完成！
    @RequestMapping(value = "/graph/getElements")
    @ResponseBody
    public String getElements(){
        //ElementBean elementBean = elementService.loginIn();
        List<ElementBean> elementBean = elementMapper.getElement();
        String s = "{\"code\":\"0\",\"elements\":[";
        int i = 0;
        for(ElementBean e : elementBean){
            if(i!=0)s += ",";
            i++;
            s += "{\"id\":\"";s += e.getElementID();s += "\",";
            s += "\"name\":\"";s += e.getElementName();s += "\",";
            s += "\"path\":\"";s += e.getElementImage();s += "\"}";
        }
        s += "]}";
        return s;
    }

    @RequestMapping("/graph/getAttributes")
    @ResponseBody
    public String getAttributes(String id){
        String test = "{\"code\":\"0\",\"elements\":[{\"id\":\"1\",\"name\":\"分输站\",\"path\":\"/elements/分输站.svg\"},{\"id\":\"2\",\"name\":\"单向阀\",\"path\":\"/elements/单向阀.svg\"},{\"id\":\"3\",\"name\":\"截断阀\",\"path\":\"/elements/截断阀.svg\"},{\"id\":\"13\",\"name\":\"阀室\",\"path\":\"/elements/阀室.svg\"}]}";
        return test;
    }




}