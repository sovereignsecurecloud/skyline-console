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
import { Card, Row, Col, Spin, Statistic } from 'antd';
import { ApiOutlined, SafetyOutlined, GlobalOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import globalProjectStore from 'stores/keystone/project';
import globalRootStore from 'stores/root';
import styles from '../style.less';

export class NetworkSecuritySummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      stats: {
        fips: 0,
        secGroups: 0,
        networks: 0,
        routers: 0,
      },
    };
  }

  componentDidMount() {
    this.fetchNetworkSecurityData();
  }

  async fetchNetworkSecurityData() {
    try {
      const user = (this.props.rootStore && this.props.rootStore.user) || globalRootStore.user || {};
      const { project: { id: projectId = '' } = {} } = user;

      await globalProjectStore.fetchProjectQuota({
        project_id: projectId,
      });

      const quota = globalProjectStore.quota || {};

      const fips = quota.floatingip && typeof quota.floatingip.used === 'number' ? quota.floatingip.used : 0;
      const secGroups = quota.security_group && typeof quota.security_group.used === 'number' ? quota.security_group.used : 0;
      const networks = quota.network && typeof quota.network.used === 'number' ? quota.network.used : 0;
      const routers = quota.router && typeof quota.router.used === 'number' ? quota.router.used : 0;

      this.setState({
        loading: false,
        stats: { fips, secGroups, networks, routers },
      });
    } catch (e) {
      console.log(e);
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, stats } = this.state;
    const { fips, secGroups, networks, routers } = stats;

    return (
      <Card
        className={styles['network-security-card']}
        title={t('Network & Security Overview')}
        bordered={false}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={6} xs={12} sm={6}>
              <div className={styles['net-stat-box']}>
                <GlobalOutlined className={styles['net-icon-blue']} />
                <Statistic title={t('Floating IPs')} value={fips} />
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['net-stat-box']}>
                <SafetyOutlined className={styles['net-icon-green']} />
                <Statistic title={t('Security Groups')} value={secGroups} />
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['net-stat-box']}>
                <DeploymentUnitOutlined className={styles['net-icon-purple']} />
                <Statistic title={t('Networks')} value={networks} />
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['net-stat-box']}>
                <ApiOutlined className={styles['net-icon-orange']} />
                <Statistic title={t('External Gateways')} value={routers} />
              </div>
            </Col>
          </Row>
        )}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(NetworkSecuritySummary));
