const { loginValidate, authenticate } = require('./request');
const { generateJwtToken } = require('./utils')
const { setCookie } = require('../../utils/cookie')

const setupRoutes = (app) => {

  app.post('/api/login', async (req, res) => {

    const loginValidationResult = loginValidate(req.body);

    if (!loginValidationResult.error) {
      const { email, password } = req.body
      const authenticationResult =  await authenticate(email, password)
      
      if(authenticationResult.isAuthenticate){

        const jwtToken = await generateJwtToken({
          _id: authenticationResult.user._id,
          name: authenticationResult.user.name
        });

        setCookie(res, 'Bearer', jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
          sameSite: 'strict', // Prevent CSRF attacks
          maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        });
        
        return res.status(200).json({user: authenticationResult.user });
      }
      else{
        return res.status(401).json({message: authenticationResult.message });
      }

    }
    return res
      .status(400)
      .json({ status:'error', message:loginValidationResult.error });

  });

};


const setup = (app) => {
  setupRoutes(app);
};

module.exports = { setup };
