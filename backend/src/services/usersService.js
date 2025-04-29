const { User, Address, Store } = require("../models");

class UserService {
  async getOauthGoogleToken(code) {
    const body = new URLSearchParams({
      code,
      client_id:
        "1065435437989-s24vtub6m0damkbqslkfoplhdg1s5ssg.apps.googleusercontent.com",
      client_secret: "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",
      redirect_uri: "http://localhost:5000/users/oauth/google",
      grant_type: "authorization_code",
    });

    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return data;
  }
  async getGoogleUserInfo(access_token, id_token) {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        params: {
          access_token,
          alt: "json",
        },
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return {
      id,
      email,
      verified_email,
      name,
      family_name,
      picture,
    };
  }
  async oauth(code) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code);
    const userInfo = await this.getGoogleUserInfo(access_token, id_token);
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const user = await databaseService.users.findOne({ email: userInfo.email });
    if (user) {
      const user = await User.create({
        username: userInfo.name,
        fullname: userInfo.family_name,
        email: userInfo.email,
        password: "",
        role: role || "buyer",
        avatarURL: userInfo.picture || "",
      });
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        token,
        user,
      };
    } else {
      const password = crypto.randomUUID();
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password,
      });
      return {
        ...data,
        user,
        verify: UserVerifyStatus.Unverified,
      };
    }
  }
}
module.exports = new UserService();
