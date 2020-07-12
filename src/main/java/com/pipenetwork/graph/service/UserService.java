package com.pipenetwork.graph.service;

import com.pipenetwork.graph.bean.UserBean;

public interface UserService {

    UserBean loginIn(String Username,String Password);

}