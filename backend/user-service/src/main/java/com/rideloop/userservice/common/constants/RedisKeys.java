package com.rideloop.userservice.common.constants;

public final class RedisKeys {

    private RedisKeys() {
    }

    // Registration
    public static final String REGISTER_DATA =
            "register:data:";

    public static final String REGISTER_OTP =
            "otp:register:";

    // College Verification
    public static final String COLLEGE_OTP =
            "otp:college:";

    // Password Reset
    public static final String RESET_PASSWORD_OTP =
            "otp:reset:";
}