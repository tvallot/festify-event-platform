package com.festify.dto;

public class LoginRequest {
    private String email;
    private String password;

    /** Récupère l'email saisi. */
    public String getEmail() {
        return email;
    }

    /** Définit l'email saisi. */
    public void setEmail(String email) {
        this.email = email;
    }

    /** Récupère le mot de passe saisi. */
    public String getPassword() {
        return password;
    }

    /** Définit le mot de passe saisi. */
    public void setPassword(String password) {
        this.password = password;
    }
}