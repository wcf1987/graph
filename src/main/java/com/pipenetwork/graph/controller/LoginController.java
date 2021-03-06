package com.pipenetwork.graph.controller;
import com.pipenetwork.graph.bean.AttributeBean;
import com.pipenetwork.graph.bean.ElementBean;
import com.pipenetwork.graph.bean.UserBean;
import com.pipenetwork.graph.mapper.AttributeMapper;
import com.pipenetwork.graph.mapper.ElementMapper;
import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import sun.misc.BASE64Encoder;

import java.io.*;
import java.util.List;

@Controller
public class LoginController {

    //将Service注入Web层
    @Autowired
    UserService userService;
    @Autowired
    ElementMapper elementMapper;
    @Autowired
    AttributeMapper attributeMapper;


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

    @RequestMapping(value = "/graph/getAttributes",method = RequestMethod.POST)
    @ResponseBody
    public String getAttributes(String id){
        List<AttributeBean> attributeBean = attributeMapper.getAttribute(id);
        String s = "{\"code\":\"0\",\"attributes\":[";
        int i = 0;
        for(AttributeBean e : attributeBean){
            if(i!=0)s += ",";
            i++;
            s += "{\"name\":\"";s += e.getAttributeName();s += "\",";
            s += "\"value\":\"";s += e.getAttributeDefaultValue();s += "\"}";
        }
        s += "]}";
        return s;
    }


    //模型保存读取test
    @RequestMapping(value = "/graph/getTestModel")
    @ResponseBody
    public String getModel()  {
        StringBuilder s = new StringBuilder();
        try{
            File file = new File("src/main/resources/models/1.xml");
            InputStreamReader in = new InputStreamReader(new FileInputStream(file),"UTF-8");
            BufferedReader br = new BufferedReader(in);
            String line = "";
            while ((line=br.readLine())!=null){
                s = s.append(line);
            }
        }catch (Exception e) {
            System.out.println(e);
            return "";
        }
        return s.toString();
    }

    @RequestMapping(value = "/graph/saveTestModel")
    @ResponseBody
    public String setModel(String file)  {
        String s = "{\"code\":\"0\"}";
        String f = "{\"code\":\"1\"}";
        try{
            File filepath = new File("src/main/resources/models/1.xml");
            OutputStreamWriter out = new OutputStreamWriter(new FileOutputStream(filepath,false),"UTF-8");
            BufferedWriter br = new BufferedWriter(out);
            br.write(file);
            br.flush();
            br.close();
        }catch (Exception e) {
            System.out.println(e);
            return f;
        }
        return s;
    }




}