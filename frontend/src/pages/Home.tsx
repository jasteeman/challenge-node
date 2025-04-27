import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Row, Col, Spin, Alert, Table } from 'antd';
import { getEmpresasConTransferenciasUltimoMes, getEmpresasAdheridasUltimoMes } from '../services/empresaService';
import { Empresa } from '../interfaces/IEmpresa';

export const HomePage = () => {
  const [transferencias, setTransferencias] = useState<Empresa[]>([]);
  const [adheridas, setAdheridas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const transferenciasData = await getEmpresasConTransferenciasUltimoMes();
      const adheridasData = await getEmpresasAdheridasUltimoMes();

      if (transferenciasData) {
        setTransferencias(transferenciasData);
      }
      if (adheridasData) {
        setAdheridas(adheridasData);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const columnsTransferencias = [
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    { title: 'CUIT', dataIndex: 'cuit', key: 'cuit' },
    { title: 'Monto Transferido', dataIndex: 'importe', key: 'importe', render: (value: number) => `$${value}` },
    { title: 'Fecha Última Transferencia', dataIndex: 'ultimaTransferencia', key: 'ultimaTransferencia', render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  const columnsAdheridas = [
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    { title: 'CUIT', dataIndex: 'cuit', key: 'cuit' },
    { title: 'Fecha de Adhesión', dataIndex: 'fechaAdhesion', key: 'fechaAdhesion', render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Panel de Inicio</h1>

      <div className="mb-4">
        <Button onClick={handleRefresh} loading={loading}>
          Actualizar Datos
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Empresas con Transferencias Último Mes">
              <Table
                columns={columnsTransferencias}
                dataSource={transferencias}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Empresas Adheridas Último Mes">
              <Table
                columns={columnsAdheridas}
                dataSource={adheridas}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default HomePage;
