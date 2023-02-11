import React from 'react';

import { Col, Empty, Row } from 'antd';

export default function NotFound() {
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
