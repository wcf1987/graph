package com.pipenetwork.graph.mapper;

import com.pipenetwork.graph.bean.AttributeBean;

import java.util.List;

public interface AttributeMapper {
    public List<AttributeBean> getAttribute(String elementid);
}
