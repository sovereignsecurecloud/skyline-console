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
import { Card, Row, Col, Spin } from 'antd';
import { CheckCircleFilled, StopFilled, ExclamationCircleFilled, DesktopOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import globalServerStore from 'stores/nova/instance';
import globalProjectStore from 'stores/keystone/project';
import styles from '../style.less';

export class InstanceStatusBreakdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      stats: {
        total: 0,
        active: 0,
        shutoff: 0,
        error: 0,
        other: 0,
      },
    };
  }

  componentDidMount() {
    this.fetchProjectInstances();
  }

  async fetchProjectInstances() {
    try {
      const servers = await globalServerStore.fetchList();
      const serverList = Array.isArray(servers)
        ? servers
        : (globalServerStore.list && globalServerStore.list.data) || [];

      let active = 0;
      let shutoff = 0;
      let error = 0;
      let other = 0;

      serverList.forEach((item) => {
        const status = (item.status || '').toUpperCase();
        if (status === 'ACTIVE') {
          active += 1;
        } else if (
          status === 'SHUTOFF' ||
          status === 'STOPPED' ||
          status === 'PAUSED' ||
          status === 'SUSPENDED' ||
          status === 'SHELVED' ||
          status === 'SHELVED_OFFLOADED'
        ) {
          shutoff += 1;
        } else if (status === 'ERROR') {
          error += 1;
        } else {
          other += 1;
        }
      });

      let total = serverList.length;
      const quotaInstances = globalProjectStore.quota && globalProjectStore.quota.instances;
      if (total === 0 && quotaInstances && typeof quotaInstances.used === 'number' && quotaInstances.used > 0) {
        total = quotaInstances.used;
      }

      this.setState({
        loading: false,
        stats: { total, active, shutoff, error, other },
      });
    } catch (e) {
      console.log(e);
      const quotaInstances = globalProjectStore.quota && globalProjectStore.quota.instances;
      const fallbackTotal = (quotaInstances && typeof quotaInstances.used === 'number') ? quotaInstances.used : 0;
      this.setState({
        loading: false,
        stats: { total: fallbackTotal, active: 0, shutoff: 0, error: 0, other: 0 },
      });
    }
  }

  render() {
    const { loading, stats } = this.state;
    const { total, active, shutoff, error } = stats;

    return (
      <Card
        className={styles['status-breakdown-card']}
        title={t('Project Instance Health')}
        bordered={false}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={6} xs={12} sm={6}>
              <div className={styles['stat-box']}>
                <div className={styles['stat-header']}>
                  <DesktopOutlined className={styles['icon-total']} />
                  <span className={styles['stat-title']}>{t('Total VMs')}</span>
                </div>
                <div className={styles['stat-number']}>{total}</div>
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['stat-box']}>
                <div className={styles['stat-header']}>
                  <CheckCircleFilled className={styles['icon-active']} />
                  <span className={styles['stat-title']}>{t('Active')}</span>
                </div>
                <div className={styles['stat-number']}>{active}</div>
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['stat-box']}>
                <div className={styles['stat-header']}>
                  <StopFilled className={styles['icon-shutoff']} />
                  <span className={styles['stat-title']}>{t('Stopped')}</span>
                </div>
                <div className={styles['stat-number']}>{shutoff}</div>
              </div>
            </Col>

            <Col span={6} xs={12} sm={6}>
              <div className={styles['stat-box']}>
                <div className={styles['stat-header']}>
                  <ExclamationCircleFilled className={styles['icon-error']} />
                  <span className={styles['stat-title']}>{t('Error')}</span>
                </div>
                <div className={styles['stat-number']}>{error}</div>
              </div>
            </Col>
          </Row>
        )}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(InstanceStatusBreakdown));
