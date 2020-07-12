package com.pipenetwork.graph.bean;

public class UserBean {
    private String Userid;
    private String Username;
    private String Password;
    private int Role;

    public String getId() {
        return Userid;
    }

    public void setId(String Userid) {
        this.Userid = Userid;
    }

    public String getName() {
        return Username;
    }

    public void setName(String Username) {
        this.Username = Username;
    }

    public String getPassword() {
        return Password;
    }

    public void setPassword(String Password) {
        this.Password = Password;
    }

    public int getRole() {
        return Role;
    }

    public void setRole(int Role) {
        this.Role = Role;
    }
}