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
import { Card, Table, Tag, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import globalServerStore from 'stores/nova/server';
import styles from '../style.less';

export class RecentInstancesTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      instances: [],
    };
  }

  componentDidMount() {
    this.fetchRecentInstances();
  }

  getAddresses(addresses = {}) {
    const ips = [];
    Object.keys(addresses).forEach((network) => {
      (addresses[network] || []).forEach((ipObj) => {
        if (ipObj.addr) {
          ips.push(ipObj.addr);
        }
      });
    });
    return ips.length > 0 ? ips.join(', ') : '-';
  }

  getStatusTag(status) {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ACTIVE') {
      return <Tag color="success">{t('ACTIVE')}</Tag>;
    }
    if (statusUpper === 'SHUTOFF' || statusUpper === 'STOPPED') {
      return <Tag color="warning">{t('SHUTOFF')}</Tag>;
    }
    if (statusUpper === 'ERROR') {
      return <Tag color="error">{t('ERROR')}</Tag>;
    }
    return <Tag color="default">{statusUpper}</Tag>;
  }

  async fetchRecentInstances() {
    try {
      const servers = await globalServerStore.pureFetchList();
      const recent = (servers || []).slice(0, 5);
      this.setState({
        loading: false,
        instances: recent,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, instances } = this.state;

    const columns = [
      {
        title: t('Instance Name'),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Link to={`/compute/instance/detail/${record.id}`}>
            <strong>{text}</strong>
          </Link>
        ),
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        key: 'status',
        render: (status) => this.getStatusTag(status),
      },
      {
        title: t('IP Addresses'),
        dataIndex: 'addresses',
        key: 'addresses',
        render: (addresses) => this.getAddresses(addresses),
      },
      {
        title: t('Created At'),
        dataIndex: 'created',
        key: 'created',
        render: (val) => (val ? new Date(val).toLocaleString() : '-'),
      },
    ];

    return (
      <Card
        className={styles['recent-instances-card']}
        title={t('Recent Instances')}
        bordered={false}
        extra={
          <Link to="/compute/instance">
            <Button type="link" size="small">
              {t('View All')} <ArrowRightOutlined />
            </Button>
          </Link>
        }
      >
        <Table
          columns={columns}
          dataSource={instances}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    );
  }
}

export default observer(RecentInstancesTable);
