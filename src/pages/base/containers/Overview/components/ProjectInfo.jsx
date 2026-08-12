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
import { Tag, Badge } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import globalUserStore from 'stores/keystone/user';
import styles from '../style.less';

export class ProjectInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetail: null,
    };
  }

  componentDidMount() {
    this.fetchUserDetail();
  }

  get rootStore() {
    return this.props.rootStore || {};
  }

  get currentUser() {
    const { user: { user } = {} } = this.rootStore;
    return user || {};
  }

  get currentProject() {
    const { user: { project } = {} } = this.rootStore;
    return project || {};
  }

  get roles() {
    const { roles = [] } = this.rootStore;
    return roles;
  }

  async fetchUserDetail() {
    const userId = this.currentUser.id;
    if (!userId) {
      return;
    }
    try {
      const detail = await globalUserStore.fetchDetail({ id: userId, silent: true });
      if (detail) {
        this.setState({ userDetail: detail });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error fetching user details:', e);
    }
  }

  render() {
    const userObj = { ...this.currentUser, ...(this.state.userDetail || {}) };
    
    // Check real_name, display_name, full_name, description, name, username
    const userName =
      userObj.real_name ||
      userObj.display_name ||
      userObj.full_name ||
      (userObj.extra && (userObj.extra.real_name || userObj.extra.display_name)) ||
      userObj.name ||
      userObj.username ||
      'Administrator';

    const domainName = (userObj.domain && userObj.domain.name) || 'Default';
    const projectName = (this.currentProject && this.currentProject.name) || this.rootStore.projectName || t('Project Overview');

    return (
      <div className={styles['hero-banner']}>
        <div className={styles['hero-content']}>
          <div className={styles['hero-greeting']}>
            <span className={styles['welcome-tag']}>
              <Badge status="processing" text={t('Active Environment')} />
            </span>
            <h2 className={styles['hero-title']}>
              {t('Welcome to TCS SovereignSecure Cloud Platform, {name}', { name: userName })}
            </h2>
            <p className={styles['hero-subtitle']}>
              {t('Managing infrastructure resources for project')} <strong>{projectName}</strong>
            </p>
          </div>
          <div className={styles['hero-pills']}>
            <div className={styles['info-pill']}>
              <UserOutlined className={styles['pill-icon']} />
              <div className={styles['pill-text']}>
                <span className={styles['pill-label']}>{t('User Account')}</span>
                <span className={styles['pill-value']}>{userName}</span>
              </div>
            </div>
            <div className={styles['info-pill']}>
              <EnvironmentOutlined className={styles['pill-icon']} />
              <div className={styles['pill-text']}>
                <span className={styles['pill-label']}>{t('Domain')}</span>
                <span className={styles['pill-value']}>{domainName}</span>
              </div>
            </div>
            <div className={styles['info-pill']}>
              <SafetyCertificateOutlined className={styles['pill-icon']} />
              <div className={styles['pill-text']}>
                <span className={styles['pill-label']}>{t('Assigned Roles')}</span>
                <div className={styles['pill-tags']}>
                  {this.roles.map((item) => (
                    <Tag color="blue" key={item.name} className={styles['role-tag']}>
                      {item.name}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default inject('rootStore')(observer(ProjectInfo));
