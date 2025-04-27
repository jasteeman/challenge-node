import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button } from "antd";
import { Empresa } from "../../interfaces/IEmpresa";

interface EmpresaFormProps {
  initialValues?: Empresa;
  onSubmit: (values: Empresa) => void;
  onCancel: () => void;
  loading: boolean;
}

const EmpresaForm: React.FC<EmpresaFormProps> = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [cuitValue, setCuitValue] = useState("");

  useEffect(() => {
    if (initialValues?.cuit) {
      const formatted = formatCUIT(initialValues.cuit);
      setCuitValue(formatted);
      form.setFieldsValue({ cuit: formatted });
    } else {
      setCuitValue("");
      form.resetFields(["cuit"]);
    }
  }, [initialValues, form]);

  const formatCUIT = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11); // Solo 11 números
    let result = "";

    if (digitsOnly.length > 0) result += digitsOnly.slice(0, 2);
    if (digitsOnly.length >= 3) result += '-' + digitsOnly.slice(2, 10);
    if (digitsOnly.length >= 11) result += '-' + digitsOnly.slice(10, 11);

    return result;
  };

  const handleCUITChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatCUIT(input);
    setCuitValue(formatted);
    form.setFieldsValue({ cuit: formatted });
  }, [form]);

  const handleFinish = (values: Empresa) => {
    console.log(values,cuitValue)
    onSubmit({ ...values});
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="CUIT"
        name="cuit"
        rules={[
          {
            required: true,
            message: "Por favor, ingrese el CUIT",
          },
          {
            pattern: /^\d{2}-\d{8}-\d{1}$/,
            message: "Formato de CUIT inválido (debe ser XX-XXXXXXXX-X)",
          }
        ]}
      >
        <Input
          value={cuitValue}
          onChange={handleCUITChange}
          maxLength={13} // 11 dígitos + 2 guiones
          disabled={loading}
          placeholder="XX-XXXXXXXX-X"
        />
      </Form.Item>

      <Form.Item
        label="Razón Social"
        name="razonSocial"
        rules={[
          {
            required: true,
            message: "Por favor, ingrese la razón social de la empresa",
          },
        ]}
      >
        <Input disabled={loading} />
      </Form.Item>

      <Form.Item
        label="Fecha de Adhesión"
        name="fechaAdhesion"
        rules={[
          {
            required: true,
            message: "Por favor, ingrese la fecha de adhesión",
          },
        ]}
      >
        <Input type="date" disabled={loading} />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end">
          <Button onClick={onCancel} style={{ marginRight: 8 }} disabled={loading}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default EmpresaForm;
