import React from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// SocialFlow components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Firebase configuration
import { auth, googleProvider } from "firebaseConfig";
import { checkAndCreateUserProfile } from "firebaseService"; // Import function

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import { useAuth } from "context/AuthContext"; // adjust path if needed

function Register() {
  const { login } = useAuth(); // Make sure to destructure login here!
  const navigate = useNavigate();

  // Handler for Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      console.log("Google sign up started");
      const result = await auth.signInWithPopup(googleProvider);
      console.log("Sign in result:", result);
      if (result && result.user) {
        login(result.user); // Update auth state
        console.log("User logged in:", result.user);

        // Ensure user has a profile in Firestore
        await checkAndCreateUserProfile();

        navigate("/dashboard"); // Redirect user
      } else {
        console.error("No user returned from Google sign in.");
      }
    } catch (error) {
      console.error("Google sign up error:", error);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput type="text" label="Name" variant="standard" fullWidth />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="email" label="Email" variant="standard" fullWidth />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password" variant="standard" fullWidth />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth>
                Sign Up
              </MDButton>
            </MDBox>

            {/* New Google Sign-Up Button */}
            <MDBox mt={2} mb={1}>
              <MDButton variant="gradient" color="error" fullWidth onClick={handleGoogleSignUp}>
                Sign Up with Google
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Register;
