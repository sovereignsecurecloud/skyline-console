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

import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import {
  isArray,
  get,
  isString,
  isBoolean,
  isNil,
  isObjectLike,
  isObject,
} from 'lodash';
import Status from 'components/Status';
import { renderFilterMap } from 'utils/index';
import { getLinkRender } from 'utils/route-map';
import classnames from 'classnames';
import globalRootStore from 'stores/root';

const { Paragraph } = Typography;

export function getStringValue(value) {
  if (
    isNil(value) ||
    (isObjectLike(value) && Object.keys(value).length === 0)
  ) {
    return '-';
  }
  if (isBoolean(value)) {
    return value.toString();
  }
  return value;
}

export function columnRender(render, value, record) {
  if (render) {
    return getStringValue(render(value, record));
  }
  return getStringValue(value);
}

export const getDefaultSorter = (dataIndex) => (a, b) => {
  const dIndex = isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
  const aValue = get(a, dIndex);
  const bValue = get(b, dIndex);
  let result = true;
  if (bValue !== null && bValue !== undefined) {
    result = aValue > bValue;
  }
  return result ? 1 : -1;
};

export const getColumnSorter = (column, props) => {
  const { isSortByBack } = props;
  const { sorter, dataIndex } = column;
  if (!isSortByBack) {
    return sorter === false ? null : sorter || getDefaultSorter(dataIndex);
  }
  return sorter === false ? null : true;
};

export const getSortOrder = (column, props) => {
  const { sortKey, sortOrder } = props;
  return (
    (sortKey === column.sortKey || sortKey === column.dataIndex) && sortOrder
  );
};

export const updateColumnSort = (newColumn, props) => {
  const { defaultSortKey, defaultSortOrder, isSortByBack } = props;
  if (
    isSortByBack &&
    defaultSortKey &&
    defaultSortOrder &&
    (newColumn.dataIndex === defaultSortKey ||
      newColumn.sortKey === defaultSortKey)
  ) {
    newColumn.defaultSortOrder = defaultSortOrder;
  }
};

export const checkIsStatusColumn = (dataIndex, isStatus) => {
  if (isStatus) {
    return true;
  }
  if (isStatus !== undefined) {
    return false;
  }
  return (
    isString(dataIndex) &&
    (dataIndex.toLowerCase().indexOf('status') >= 0 ||
      dataIndex.toLowerCase().indexOf('state') >= 0)
  );
};

export const getStatusRender = (render) => (value) => {
  const text = render ? render(value) : value;
  // 'display block' fix for missing text in the case of narrow screen
  return <Status status={value} text={text} style={{ display: 'block' }} />;
};

export const getValueRenderFunc = (valueRender) => {
  if (isString(valueRender)) {
    return renderFilterMap[valueRender];
  }
  return null;
};

export const getRender = (valueRender) => {
  if (!valueRender) {
    return null;
  }
  return (value) => {
    const func = getValueRenderFunc(valueRender);
    if (func) {
      return func(value);
    }
    return '-';
  };
};

export const getProjectId = (record) =>
  record.project_id || record.owner || record.fingerprint || record.tenant;

export const projectRender = (value, record) => {
  const projectId = getProjectId(record);
  if (!projectId) {
    return '-';
  }
  const idRender = getIdRender(projectId, true, false);
  return (
    <>
      <div>{idRender}</div>
      <div>{value || '-'}</div>
    </>
  );
};

const getLinkUrl = (prefix, id) => {
  if (!prefix) {
    return null;
  }
  if (prefix[prefix.length - 1] === '/') {
    return `${prefix}${id}`;
  }
  return `${prefix}/${id}`;
};

export const getIdRender = (value, copyable = true, isLink = true) => {
  const short = `${value || ''}`.substring(0, 8);
  const shortRender = isLink ? (
    <span className="link-class">{short}</span>
  ) : (
    short
  );
  if (!copyable) {
    return shortRender;
  }
  const onClick = (e) => {
    if (e) {
      const { nodeName = '', className = '' } = e.target || {};
      const copyNodeNames = ['svg', 'path'];
      const isCopyClick =
        copyNodeNames.includes(nodeName) ||
        (isString(className) && className.includes('copy'));
      if (isCopyClick && e.stopPropagation) {
        return e.stopPropagation();
      }
    }
  };
  return (
    <Paragraph
      copyable={{ text: value }}
      className={classnames('no-wrap', 'no-margin-bottom', 'inline-block')}
      onClick={onClick}
    >
      {shortRender}
    </Paragraph>
  );
};

export const getIpRender = (ip, copyable = true) => {
  if (!ip || (isArray(ip) && ip.length === 0)) {
    return '-';
  }
  if (isArray(ip)) {
    return ip.map((item) => (
      <div key={item} style={{ marginBottom: 2 }}>
        {getIpRender(item, copyable)}
      </div>
    ));
  }
  const ipStr = `${ip}`;
  if (!copyable) {
    return <span>{ipStr}</span>;
  }
  const onClick = (e) => {
    if (e) {
      const { nodeName = '', className = '' } = e.target || {};
      const copyNodeNames = ['svg', 'path'];
      const isCopyClick =
        copyNodeNames.includes(nodeName) ||
        (isString(className) && className.includes('copy'));
      if (isCopyClick && e.stopPropagation) {
        return e.stopPropagation();
      }
    }
  };
  return (
    <Paragraph
      copyable={{ text: ipStr }}
      className={classnames('no-wrap', 'no-margin-bottom', 'inline-block')}
      onClick={onClick}
      style={{ marginBottom: 0 }}
    >
      <span>{ipStr}</span>
    </Paragraph>
  );
};

const isNameBold = (dataIndex, title, boldName, withoutId) => {
  return boldName === undefined
    ? withoutId
      ? false
      : title === t('ID/Name') || dataIndex === 'name'
    : boldName;
};

export const getNameRenderWithStyle = (name, _isBold) => {
  const style = {
    fontWeight: 600,
    fontSize: '15px',
  };
  return <div style={style}>{name || '-'}</div>;
};

export const getNameRender = (render, column, rowKey) => {
  if (render) {
    return render;
  }
  const {
    linkPrefix,
    dataIndex,
    idKey,
    linkPrefixFunc,
    linkFunc,
    hasNoDetail = false,
    copyable = true,
    boldName,
    title,
  } = column;
  return (value, record) => {
    const idValue = get(record, idKey || rowKey);
    let url = null;
    if (linkFunc) {
      url = linkFunc(value, record);
    } else {
      const linkValue = linkPrefixFunc
        ? linkPrefixFunc(value, record)
        : linkPrefix;
      url = getLinkUrl(linkValue, idValue);
    }
    const isBold = isNameBold(dataIndex, title, boldName, false);
    const nameValue = value || get(record, dataIndex) || '-';
    const idRender = getIdRender(idValue, copyable, false);
    if (hasNoDetail || !url) {
      return (
        <div>
          {getNameRenderWithStyle(nameValue, isBold)}
          <div>{idRender}</div>
        </div>
      );
    }
    const nameLink = (
      <Link to={url} className="link-class" style={{ fontWeight: 600, fontSize: '15px' }}>
        {nameValue}
      </Link>
    );
    return (
      <div>
        <div>{nameLink}</div>
        <div>{idRender}</div>
      </div>
    );
  };
};

export const getNameRenderByRouter = (render, column, rowKey) => {
  if (render) {
    return render;
  }
  const {
    dataIndex,
    idKey,
    emptyRender,
    routeName,
    getRouteName,
    routeParamsKey = 'id',
    routeQuery = {},
    routeParamsFunc,
    withoutName = false,
    copyable = true,
    boldName,
    title,
    withoutId = false,
  } = column;
  return (value, record) => {
    const nameValue = value || get(record, dataIndex) || '-';
    const _isBold = isNameBold(dataIndex, title, boldName, withoutId);
    const currentRouteName = getRouteName
      ? getRouteName(value, record)
      : routeName;
    if (!currentRouteName) {
      return <div style={{ fontWeight: 600, fontSize: '15px' }}>{nameValue}</div>;
    }
    const idValue = get(record, idKey || rowKey);
    if (!idValue) {
      return emptyRender ? emptyRender() : '-';
    }
    const idRender = getIdRender(idValue, copyable, false);
    const params = routeParamsFunc
      ? routeParamsFunc(record)
      : { [routeParamsKey]: idValue };
    const query = routeQuery;
    const nameLinkRender = (
      <span className="link-class" style={{ fontWeight: 600, fontSize: '15px' }}>
        {nameValue}
      </span>
    );
    const link = getLinkRender({
      key: currentRouteName,
      params,
      query,
      value: nameLinkRender,
    });
    if (!withoutId) {
      return (
        <div>
          <div>{link}</div>
          {!withoutName && <div>{idRender}</div>}
        </div>
      );
    }
    return <div>{link}</div>;
  };
};

export const idNameColumn = {
  title: t('ID/Name'),
  dataIndex: 'name',
  render: (value, record) => {
    const idRender = getIdRender(record.id, true, false);
    const nameRender = getNameRenderWithStyle(value, true);
    return (
      <>
        {nameRender}
        <div>{idRender}</div>
      </>
    );
  },
};

export const getValueMapRender = (column) => {
  const { valueMap, render } = column;
  if (render) {
    return render;
  }
  if (valueMap && isObject(valueMap)) {
    return (value) => valueMap[value] || value;
  }
  return null;
};

export const getUnitRender = (column) => {
  const { unit, render } = column;
  if (render) {
    return render;
  }
  if (unit) {
    return (value) => {
      if ([undefined, null, ''].includes(value)) {
        return '-';
      }
      return `${value}${unit}`;
    };
  }
  return null;
};

export const getProjectRender = (render) => {
  if (render) {
    return render;
  }
  return (value, record) => {
    const projectId = getProjectId(record);
    if (!projectId) {
      return '-';
    }
    const { hasAdminRole } = globalRootStore;
    const hasLink = !!hasAdminRole;
    const idRender = getIdRender(projectId, true, false);
    const projectName = value || '-';
    if (hasLink) {
      const url = `/identity/project-admin/detail/${projectId}`;
      const projectLink = (
        <Link to={url} className="link-class" style={{ fontWeight: 600, fontSize: '15px' }}>
          {projectName}
        </Link>
      );
      return (
        <>
          <div>{projectLink}</div>
          <div>{idRender}</div>
        </>
      );
    }
    return (
      <>
        <div style={{ fontWeight: 600, fontSize: '15px' }}>{projectName}</div>
        <div>{idRender}</div>
      </>
    );
  };
};
