import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Row, Col, Spin, Alert, Table, DatePicker } from 'antd';
import { getEmpresasConTransferenciasUltimoMes, getEmpresasAdheridasUltimoMes } from '../services/empresaService';
import { Empresa } from '../interfaces/IEmpresa';
import { format } from 'date-fns';
import esES from 'antd/es/date-picker/locale/es_ES';
import { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export const HomePage = () => {
  const [transferencias, setTransferencias] = useState<Empresa[]>([]);
  const [adheridas, setAdheridas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let transferenciasData: Empresa[] | null = [];
      let adheridasData: Empresa[] | null = [];

      if (dateRange) {
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
          const formattedStartDate = format(startDate, 'yyyy-MM-dd');
          const formattedEndDate = format(endDate, 'yyyy-MM-dd');

          const params: Record<string, string | number | boolean | undefined> = {
            fechaInicio: formattedStartDate,
            fechaFin: formattedEndDate,
          };
          const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
          );
          const parsedQueryString = new URLSearchParams();
          for (const key in filteredParams) {
            if (filteredParams.hasOwnProperty(key) && filteredParams[key] !== undefined) {
              parsedQueryString.append(key, String(filteredParams[key]));
            }
          }
          const queryString = parsedQueryString.toString();

          transferenciasData = (await getEmpresasConTransferenciasUltimoMes(queryString)) || [];
          adheridasData = (await getEmpresasAdheridasUltimoMes(queryString)) || [];
        }
      }
      
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
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange([start?.toDate() || null, end?.toDate() || null]);
    } else {
      setDateRange(null);
    }
  };

  const columnsTransferencias = [
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    { title: 'CUIT', dataIndex: 'cuit', key: 'cuit' },
    { title: 'Monto Transferido', dataIndex: 'importe', key: 'importe', render: (value: number) => `$${value}` },
    { title: 'Fecha Última Transferencia', dataIndex: 'ultimaTransferencia', key: 'ultimaTransferencia', render: (value: string) => new Date(value).toLocaleDateString('es-AR') },
  ];

  const columnsAdheridas = [
    { title: 'Razón Social', dataIndex: 'razonSocial', key: 'razonSocial' },
    { title: 'CUIT', dataIndex: 'cuit', key: 'cuit' },
    { title: 'Fecha de Adhesión', dataIndex: 'fechaAdhesion', key: 'fechaAdhesion', render: (value: string) => new Date(value).toLocaleDateString('es-AR') },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Panel de Inicio</h1>

      <div className="mb-4">
        <RangePicker
          onChange={handleDateRangeChange}
          locale={esES}
          format="DD/MM/YYYY"
        />
        <Button onClick={handleRefresh} loading={loading} style={{ marginLeft: '8px' }}>
          Buscar por Fechas
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
            <Card title="Empresas con Transferencias dentro del periodo">
              <Table
                columns={columnsTransferencias}
                dataSource={transferencias}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Empresas Adheridas dentro del periodo">
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
