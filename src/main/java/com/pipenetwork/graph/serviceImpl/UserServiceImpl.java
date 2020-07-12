package com.pipenetwork.graph.serviceImpl;

import com.pipenetwork.graph.bean.UserBean;
import com.pipenetwork.graph.mapper.UserMapper;
import com.pipenetwork.graph.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    //将DAO注入Service层
    @Autowired(required=false)
    private UserMapper userMapper;

    @Override
    public UserBean loginIn(String Username, String Password) {
        return userMapper.getInfo(Username,Password);
    }

}