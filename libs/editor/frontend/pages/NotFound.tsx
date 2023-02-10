import React, { useEffect } from 'react';

import { Col, Empty, Row } from 'antd';
import { HeaderSetter } from '../common/types';

type Props = {
  setHeaderConfig: HeaderSetter
};
export default function NotFound(props: Props) {
  useEffect(
    () => props.setHeaderConfig({
      title: 'Not Found',
      subtitle: 'This page could not be found',
    }),
    []
  );

  return (
    <Row align="middle" justify="center" style={{ height: '100%', }}>
      <Col>
        <Empty
          style={{ height: '100%', }}
          description="Page Not Found"
        />
      </Col>
    </Row>
  );
}
