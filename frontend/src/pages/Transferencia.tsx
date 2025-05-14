import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Button, message, Modal, Spin, Table, } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    createTransferencia,
    deleteTransferencia,
    getTransferenciasPorEmpresa,
    updateTransferencia,
} from '../services/transferenciaService';
import { ColumnsType } from 'antd/lib/table';
import { Transferencia } from '../interfaces/ITransferencia';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { TransferenciaForm } from '../components/transferencia/transferenciaForm';

export const TransferenciaPage = () => {
    const { id } = useParams(); 
    const [data, setData] = useState<Transferencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransferencia, setEditingTransferencia] = useState<Transferencia | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const navigate = useNavigate();



    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            if (id) {
                const {data} = await getTransferenciasPorEmpresa(parseInt(id));
                 if (data) {
                    setData(data);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar las transferencias');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const handleCreateEdit = useCallback((transferencia?: Transferencia) => {
        setEditingTransferencia(transferencia || null);
        setIsModalOpen(true);
    }, []);

    const handleRemove = useCallback(async (transferencia: Transferencia) => {
        Modal.confirm({
            title: "¿Estás seguro de eliminar esta transferencia?",
            content: `Importe: $${transferencia.importe.toFixed(2)}, Cuenta Débito: ${transferencia.cuentaDebito}, Cuenta Crédito: ${transferencia.cuentaCredito}`,
            onOk: async () => {
                try {
                    const deleted = await deleteTransferencia(Number(transferencia.id));
                    if (deleted) {
                        message.success("Transferencia eliminada exitosamente");
                        await fetchList();
                    } else {
                        message.error("Error al eliminar la transferencia");
                    }
                } catch (error) {
                    message.error("Error al eliminar la transferencia");
                }

            },
        });
    }, [fetchList]);
 
    const columns = useMemo<ColumnsType<Transferencia>>(() => [
        {
            title: "Importe",
            dataIndex: "importe",
            width: "20%",
            render: (importe: number) => `$${importe}`,
        },
        {
            title: "Cuenta Débito",
            dataIndex: "cuentaDebito",
            width: "30%",
        },
        {
            title: "Cuenta Crédito",
            dataIndex: "cuentaCredito",
            width: "30%",
        },
        {
            title: "Fecha Transferencia",
            dataIndex: "fechaTransferencia",
            key: 'fechaTransferencia',
            width: "20%",
            render: (fecha: Date) => moment(fecha).format('DD/MM/YYYY HH:mm:ss'),
        },
        {
            title: "Acciones",
            dataIndex: "actions",
            width: "20%",
            align: "center",
            render: (_, record: Transferencia) => (
                <>
                    <Button type="link" onClick={() => handleCreateEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" danger onClick={() => handleRemove(record)}>
                        Eliminar
                    </Button>
                </>
            ),
        },
    ], [handleCreateEdit, handleRemove]); 

    const handleFormSubmit = useCallback(async (values: Omit<Transferencia, 'id' > & { idEmpresa: number }) => {
        setFormLoading(true);
        try {
            if (editingTransferencia?.id) {
                const updated = await updateTransferencia(editingTransferencia.id, {...values,importe: Number(values.importe),idEmpresa:Number(id)});
                if (updated) {
                    message.success("Transferencia actualizada exitosamente");
                }
            } else {
                const created = await createTransferencia({...values,idEmpresa:Number(id)});
                if (created) {
                    message.success("Transferencia creada exitosamente");
                }
            }
            await fetchList();
            setIsModalOpen(false);
            setEditingTransferencia(null);
        } catch (error: any) {
            alert(error.message || "Error al guardar la transferencia");
        } finally {
            setFormLoading(false);
        }
    }, [editingTransferencia?.id, fetchList]);

    const handleCancelModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingTransferencia(null);
    }, []);



    const handleVolverAEmpresas = () => {
        navigate('/empresas');
    };



    return (
        <div className="p-4">
            <div className="mb-4">
                <Button onClick={handleVolverAEmpresas} icon={<ArrowLeftOutlined />}>
                    Volver a Empresas
                </Button>
                <h1 className="text-2xl font-semibold ml-4 inline-block">Transferencias de la Empresa (ID: {id})</h1>
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
                <Spin size="large" />
            ) : (
                <>
                    <div className="mb-4">
                        <Button type="primary" onClick={() => handleCreateEdit()}>
                            Nueva Transferencia
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        loading={loading}
                        dataSource={data} 
                    />
                    <Modal
                        title={editingTransferencia ? "Editar Transferencia" : "Nueva Transferencia"}
                        open={isModalOpen}
                        onCancel={handleCancelModal}
                        footer={null}
                    >
                        <TransferenciaForm
                            initialValues={editingTransferencia || undefined}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancelModal}
                            loading={formLoading}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default TransferenciaPage;
