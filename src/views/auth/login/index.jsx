import { Button, Col, FormControl, FormLabel, InputGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import PageMeta from '@/components/PageMeta';
const Login = () => {
  return <>
      <PageMeta title={'Login'} />
      <Row className="justify-content-center">
        <Col xs={11} md={8} lg={6} xl={4}>
          <div id="regular-login" className="login-card p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <h2 className="text-center mb-4">Login</h2>
            <p className="text-center text-white opacity-50 mb-4">Keep it all together and you&apos;ll be free</p>
            <form>
              <div className="mb-3">
                <FormLabel htmlFor="email">Email or Phone</FormLabel>
                <FormControl type="email" size={'lg'} className="text-white bg-dark border-light border-opacity-25 bg-opacity-25" id="email" required />
              </div>
              <div className="mb-3">
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <FormControl size={'lg'} type="password" className="text-white bg-dark border-light border-opacity-25 bg-opacity-25" id="password" />
                </InputGroup>
              </div>
              <div className="d-grid mb-3">
                <Button type="submit" variant="primary" size={'lg'} className="bg-primary bg-opacity-75">
                  Sign In
                </Button>
              </div>
              <div className="text-center mb-4">
                <Link to="/auth/forgot-password" className="text-decoration-none small text-white">
                  Forgot Password?
                </Link>
              </div>
              <div className="divider small text-white opacity-25">or</div>
              <div className="d-grid mb-3">
                <Button variant="dark" size={'lg'} type="button" id="switchToToken" className="bg-opacity-50 border-dark">
                  Login Using Token
                </Button>
              </div>
            </form>
          </div>
          <div id="token-login" className="login-card d-none p-4 p-md-6 bg-dark bg-opacity-50 translucent-dark rounded-4">
            <h2 className="text-center mb-4">Login</h2>
            <p className="text-center text-white opacity-50 mb-4">Keep it all together and you&apos;ll be free</p>
            {/*    <form>*/}
            {/*        <div className="d-grid mb-3">*/}
            {/*            <button type="submit" className="btn btn-lg bg-opacity-75" style={{backgroundColor:"#4285F4", borderColor:"#4285F4" color:"#FFFFFF",*/}
            {/*                --bs-btn-hover-bg:#357ae8; --bs-btn-hover-border-color:#357ae8; --bs-btn-hover-color:#FFFFFF;*/}
            {/*                --bs-btn-active-bg:#3367d6; --bs-btn-active-border-color:#3367d6; --bs-btn-active-color:#FFFFFF;}}>*/}
            {/*                Sign In Using Google*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        <div className="d-grid mb-3">*/}
            {/*            <button type="submit" className="btn btn-lg bg-opacity-75" style="--bs-btn-bg:#0078D4; --bs-btn-border-color:#0078D4; --bs-btn-color:#FFFFFF;*/}
            {/*--bs-btn-hover-bg:#005A9E; --bs-btn-hover-border-color:#005A9E; --bs-btn-hover-color:#FFFFFF;*/}
            {/*--bs-btn-active-bg:#004377; --bs-btn-active-border-color:#004377; --bs-btn-active-color:#FFFFFF;">*/}
            {/*                Sign In Using Microsoft*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        <div className="d-grid mb-3">*/}
            {/*            <button type="submit" className="btn btn-lg bg-opacity-75" style="--bs-btn-bg:#D1D1D6; --bs-btn-border-color:#D1D1D6; --bs-btn-color:#000000;*/}
            {/*--bs-btn-hover-bg:#C7C7CC; --bs-btn-hover-border-color:#C7C7CC; --bs-btn-hover-color:#000000;*/}
            {/*--bs-btn-active-bg:#BABAC0; --bs-btn-active-border-color:#BABAC0; --bs-btn-active-color:#000000;">*/}
            {/*                Sign In Using Apple*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        <div className="divider small text-white opacity-25">or</div>*/}

            {/*        <div className="d-grid mb-3">*/}
            {/*            <button type="button" id="switchToRegular"*/}
            {/*                    className="btn btn-dark bg-opacity-50 border-dark btn-lg">*/}
            {/*                Sign In Using Password*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*    </form>*/}
          </div>
        </Col>
      </Row>
    </>;
};
export default Login;