// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import renderRoutes from 'utils/RouterConfig';
import SelectLang from 'components/SelectLang';

import tcsLogo from 'asset/image/tcs_logo.png';
import tcssscwhite from 'asset/image/ssc_white.png';
import backgroundDark from 'asset/image/background_dark.png';
import styles from './index.less';

export class AuthLayout extends Component {
  constructor(props) {
    super(props);

    this.routes = props.route.routes;
  }

  renderRight() {
    return (
      <div className={styles.right}>
        <img
          alt=""
          className={styles['login-full-image']}
          src={backgroundDark}
        />
        <div className={styles['right-top-logo']}>
          <img
            src={tcsLogo}
            alt="TCS Logo"
            className={styles['login-right-logo']}
          />
        </div>
        <div className={styles['right-center-content']}>
          <img alt="Platform Logo" className={styles['ssc-logo']} src={tcssscwhite} />
          <h2 className={styles['ssc-title']}>Welcome to TCS SovereignSecure Cloud Platform</h2>
          <p className={styles['ssc-subtitle']}>Enterprise Cloud Portal</p>
        </div>
        {/* <div className={styles['right-footer']}>
          Copyright © 2026 Tata Consultancy Services
        </div> */}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.container}>
        {this.renderRight()}
        <div className={styles.left}>
          <div className={styles.lang}>
            <SelectLang />
          </div>
          <div className={styles.main}>
            <div className={styles.top}>
              <div className={styles.header}>
                <img alt="logo" className={styles.logo} src={tcsLogo} />
              </div>
            </div>
            {renderRoutes(this.routes)}
          </div>
        </div>
      </div>
    );
  }
}

export default inject('rootStore')(observer(AuthLayout));
