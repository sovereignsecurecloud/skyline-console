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
import { observer } from 'mobx-react';
import { Row, Col } from 'antd';
import overviewInstance from 'asset/image/overview-instance.svg';
import overviewNetwork from 'asset/image/overview-network.svg';
import overviewRouter from 'asset/image/overview-router.svg';
import overviewVolume from 'asset/image/overview-volume.svg';
import { Link } from 'react-router-dom';
import globalRootStore from 'stores/root';
import styles from './style.less';
import QuotaOverview from './components/QuotaOverview';
import ProjectInfo from './components/ProjectInfo';
import InstanceStatusBreakdown from './components/InstanceStatusBreakdown';
import NetworkSecuritySummary from './components/NetworkSecuritySummary';

const actions = [
  {
    key: 'instance',
    label: t('Instances'),
    avatar: overviewInstance,
    to: '/compute/instance',
    subtitle: t('Virtual Compute Workloads'),
  },
  {
    key: 'volume',
    label: t('Volumes'),
    avatar: overviewVolume,
    to: '/storage/volume',
    subtitle: t('Persistent Block Storage'),
  },
  {
    key: 'network',
    label: t('Networks'),
    avatar: overviewNetwork,
    to: '/network/networks',
    subtitle: t('Virtual Subnets & VLANs'),
  },
  {
    key: 'router',
    label: t('Routers'),
    avatar: overviewRouter,
    to: '/network/router',
    subtitle: t('Gateways & L3 Forwarding'),
  },
];

export class Overview extends Component {
  get filterActions() {
    if (!globalRootStore.checkEndpoint('cinder')) {
      return actions.filter((it) => it.key !== 'volume');
    }
    return actions;
  }

  get span() {
    if (!globalRootStore.checkEndpoint('cinder')) {
      return 8;
    }
    return 6;
  }

  renderAction = (item) => (
    <div className={styles['action-card']}>
      <div className={styles['icon-wrapper']}>
        <img alt={item.label} src={item.avatar} className={styles['action-icon']} />
      </div>
      <div className={styles['action-text']}>
        <div className={styles['action-title']}>{item.label}</div>
        <div className={styles['action-subtitle']}>{item.subtitle}</div>
      </div>
    </div>
  );

  renderActions() {
    return this.filterActions.map((item) => (
      <Col span={this.span} key={item.key} xs={24} sm={12} md={this.span}>
        <Link to={item.to} className={styles['action-link']}>
          {this.renderAction(item)}
        </Link>
      </Col>
    ));
  }

  render() {
    return (
      <div className={styles.container}>
        {/* 1. Hero Welcome Header */}
        <Row style={{ marginBottom: 20 }}>
          <Col span={24}>
            <ProjectInfo />
          </Col>
        </Row>

        {/* 2. Quick Access Shortcuts Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {this.renderActions()}
        </Row>

        {/* 3. Instance Status & Network Security Health Summaries */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12} xs={24} lg={12}>
            <InstanceStatusBreakdown />
          </Col>
          <Col span={12} xs={24} lg={12}>
            <NetworkSecuritySummary />
          </Col>
        </Row>

        {/* 4. Resource Quota Monitors */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <QuotaOverview />
          </Col>
        </Row>
      </div>
    );
  }
}

export default observer(Overview);
