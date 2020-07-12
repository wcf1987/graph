package com.pipenetwork.graph.mapper;

import com.pipenetwork.graph.bean.UserBean;

public interface UserMapper {

    UserBean getInfo(String Username,String Password);

}