import { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import { Transferencia } from '../../interfaces/ITransferencia';


export const TransferenciaForm = ({
    initialValues,
    onSubmit,
    onCancel,
    loading
}: {
    initialValues?: Transferencia,
    onSubmit: (values: Omit<Transferencia, 'id'>) => Promise<void>,
    onCancel: () => void,
    loading: boolean
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            importe: initialValues?.importe,
            cuentaDebito: initialValues?.cuentaDebito,
            cuentaCredito: initialValues?.cuentaCredito,
            fechaTransferencia: initialValues?.fechaTransferencia
            ? new Date(initialValues.fechaTransferencia).toISOString().substring(0, 10)
            : undefined,
                  });
    }, [form, initialValues]);

    const handleFinish = async (values: any) => {
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <Form form={form} onFinish={handleFinish} layout="vertical">
            <Form.Item
                label="Importe"
                name="importe"
                rules={[{ required: true, message: 'Por favor, ingrese el importe' }]}
            >
                <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
                label="Cuenta Débito"
                name="cuentaDebito"
                rules={[{ required: true, message: 'Por favor, ingrese la cuenta de débito' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Cuenta Crédito"
                name="cuentaCredito"
                rules={[{ required: true, message: 'Por favor, ingrese la cuenta de crédito' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Fecha de Transferencia"
                name="fechaTransferencia"
                rules={[
                    {
                        required: true,
                        message: "Por favor, ingrese la fecha de transferencia",
                    },
                ]}
            >
                <Input type="date" disabled={loading} />
            </Form.Item>
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Guardar
                </Button>
            </div>
        </Form>
    );
};