const { checkPassword, hashPassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { User } = require("../models/");

class userController {
  static async registerUser(req, res, next) {
    try {
      const { username, email, password, role, birthDate, gender } = req.body;

      const user = await User.create({
        username,
        email,
        password,
        role,
        birthDate,
        gender,
      });

      res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        throw { name: "InvalidCredentials" };
      }
      const token = generateToken({
        id: user.id,
        email: user.email,
      });
      if (checkPassword(password, user.password)) {
        res.status(200).json({
          statusCode: 200,
          access_token: token,
          email: user.email,
          role: user.role,
        });
      } else {
        throw { name: "InvalidCredentials" };
      }
    } catch (error) {
      next(error);
    }
  }

  static async editUser(req, res, next) {
    try {
      const { userId } = req.additionalData;
      const { username, email, password, role, birthDate, gender } = req.body;

      const editUser = await User.update(
        {
          username,
          email,
          password: hashPassword(password),
          role,
          birthDate,
          gender,
        },
        {
          where: {
            id: userId,
          },
        }
      );

      if (!editUser) throw { name: "userEdit" };

      res.status(201).json({
        message: `User with id ${userId} has been updated`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.additionalData;

      const user = await User.findByPk(userId);

      if (!user) {
        throw { name: "NotFound" };
      }

      const deleteUser = await user.destroy({
        where: { id: userId },
      });

      if (deleteUser) {
        res.status(200).json({
          statusCode: 200,
          message: "Your account has been deleted",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = userController;