package com.pipenetwork.graph.bean;

public class ElementBean {
    private String ElementID;
    private int ElementType;
    private String ElementName;
    private String ElementImage;
    public String getElementID() {
        return ElementID;
    }

    public int getElementType() {
        return ElementType;
    }

    public String getElementName() {
        return ElementName;
    }

    public String getElementImage() {
        return ElementImage;
    }

    public void setElementID(String elementID) {
        ElementID = elementID;
    }

    public void setElementType(int elementType) {
        ElementType = elementType;
    }

    public void setElementName(String elementName) {
        ElementName = elementName;
    }

    public void setElementImage(String elementImage) {
        ElementImage = elementImage;
    }
}
