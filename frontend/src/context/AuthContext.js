import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "firebaseConfig"; // Make sure this is correctly imported

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // Change `null` to `undefined`
  const [loading, setLoading] = useState(true);

  const login = (firebaseUser) => {
    setUser(firebaseUser);
    localStorage.setItem("user", JSON.stringify(firebaseUser));
  };

  const logout = async () => {
    console.log("Logging out...");
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("🔥 Firebase user on load:", firebaseUser);
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.setItem("user", JSON.stringify(firebaseUser));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false); // Done loading
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div></div>; // Prevent rendering until Firebase loads
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
