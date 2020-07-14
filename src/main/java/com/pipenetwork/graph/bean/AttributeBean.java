package com.pipenetwork.graph.bean;

public class AttributeBean {
    private String AttributeID;
    private String ElementID;
    private String AttributeName;
    private String AttributeType;
    private String AttributeDefaultValue;
    public String getAttributeID() {
        return AttributeID;
    }

    public String getElementID() {
        return ElementID;
    }

    public String getAttributeName() {
        return AttributeName;
    }

    public String getAttributeType() {
        return AttributeType;
    }

    public String getAttributeDefaultValue() {
        return AttributeDefaultValue;
    }
    public void setAttributeID(String attributeID) {
        AttributeID = attributeID;
    }

    public void setElementID(String elementID) {
        ElementID = elementID;
    }

    public void setAttributeName(String attributeName) {
        AttributeName = attributeName;
    }

    public void setAttributeType(String attributeType) {
        AttributeType = attributeType;
    }

    public void setAttributeDefaultValue(String attributeDefaultValue) {
        AttributeDefaultValue = attributeDefaultValue;
    }
}
