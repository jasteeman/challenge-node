import { useState, useEffect, useCallback } from 'react';
import { Button, message, Modal, Table } from 'antd';
import Search from 'antd/es/input/Search';
import {
  createEmpresa,
  deleteEmpresa,
  getEmpresas,
  updateEmpresa,
} from '../services/empresaService';
import { ColumnsType, TableProps } from 'antd/lib/table';
import { Empresa } from '../interfaces/IEmpresa';
import { SortOrder } from 'antd/lib/table/interface';
import debounce from 'lodash/debounce';
import EmpresaForm from '../components/empresa/EmpresaForm';
import { GetProp } from 'antd/lib';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { format } from 'date-fns';

type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
}

export const GestionEmpresa = () => {
  const [data, setData] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<any>(null);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: undefined,
    sortOrder: undefined,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const limit = tableParams!.pagination!.pageSize!;
      const page = tableParams!.pagination!.current!;
      const params: Record<string, string | number | boolean | undefined> = {
        page: page,
        limit: limit,
        q: searchText,
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder === "ascend" ? "asc" : tableParams.sortOrder === "descend" ? "desc" : undefined,
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
      const data = await getEmpresas(queryString);
      if (data) {
        setData(data.rows);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.count,
          },
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchText, tableParams.pagination?.pageSize, tableParams.pagination?.current, tableParams.sortField, tableParams.sortOrder]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const debouncedSearch = useCallback(debounce((text: string) => {
    setSearchText(text);
  }, 300), []);

  const onSearch = (text: string) => {
    debouncedSearch(text);
  };

  const handleTableChange: TableProps<Empresa>["onChange"] = (pagination, _filters, sorter) => {
    let sortField: string | undefined = undefined;
    let sortOrder: SortOrder | undefined = undefined;
    if (Array.isArray(sorter)) {
      if (sorter.length > 0) {
        sortField = sorter[0].field as string | undefined;
        sortOrder = sorter[0].order;
      }
    } else {
      sortField = sorter.field as string | undefined;
      if (sorter && sorter.order && (sorter.order === "ascend" || sorter.order === "descend")) {
        sortOrder = sorter.order;
      }
    }
    setTableParams({
      ...tableParams,
      pagination,
      sortField,
      sortOrder,
    });
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleCreateEdit = useCallback((empresa?: Empresa) => {
    setEditingEmpresa(empresa || null);
    setIsModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(async (values: Empresa) => {
    setFormLoading(true);
    try {
      if (editingEmpresa?.id) {
        await updateEmpresa(editingEmpresa.id, values);
        message.success("Empresa actualizada exitosamente");
      } else {
        await createEmpresa(values);
        message.success("Empresa creada exitosamente");
      }
      await fetchList();
      setIsModalOpen(false);
      setEditingEmpresa(null);
    } catch (error: any) {
      alert(error.message || "Error al guardar la empresa");
    } finally {
      setFormLoading(false);
    }
  }, [editingEmpresa?.id, fetchList]);

  const handleCancelModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEmpresa(null);
  }, []);

  const handleRemove = useCallback(async (empresa: Empresa) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar esta empresa?",
      content: `CUIT: ${empresa.cuit}, Razón Social: ${empresa.razonSocial}`,
      onOk: async () => {
        const deleted = await deleteEmpresa(Number(empresa.id));
        if (deleted) {
          message.success("Empresa eliminada exitosamente");
          await fetchList();
        } else {
          message.error("Error al eliminar la empresa");
        }
      },
    });
  }, [fetchList]);

  const handleVerTransferencias = (idEmpresa: number) => {
    setSelectedEmpresaId(idEmpresa);
  };

  const getColumns = useCallback((): ColumnsType<Empresa> => [
    {
      title: "CUIT",
      dataIndex: "cuit",
      width: "20%",
      responsive: ["md", "sm", "xs"],
      sorter: (a, b) => a.cuit.localeCompare(b.cuit),
    },
    {
      title: "Razón Social",
      dataIndex: "razonSocial",
      width: "35%",
      responsive: ["md", "sm", "xs"],
      sorter: (a, b) => a.razonSocial.localeCompare(b.razonSocial),
    },
    {
      title: "Fecha de Adhesión",
      dataIndex: "fechaAdhesion",
      width: "25%",
      responsive: ["md", "sm", "xs"],
      render: (fecha: string) => {
        if (!fecha) return 'N/A';
        const fechaObj = new Date(fecha);
        fechaObj.setDate(fechaObj.getDate() + 1);
        return format(fechaObj, 'dd/MM/yyyy HH:mm:ss');
      }
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      width: "20%",
      align: "center",
      render: (_, record: Empresa) => (
        <>
          <Button type="link" onClick={() => handleCreateEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleRemove(record)}>
            Eliminar
          </Button>
          <Link to={`/empresas/transferencias/${record.id}`}>
            Ver transf.
          </Link>
        </>
      ),
    },
  ], [handleCreateEdit, handleRemove, handleVerTransferencias]);

  return (
    <>

      <div className="mb-3 flex items-center">
        <Search
          placeholder="Buscar por CUIT o Razón Social"
          allowClear
          onSearch={onSearch}
          className="w-1/4 mr-1"
        />
        <div className="mr-2">{tableParams.pagination?.total} resultados</div>
        <div className="ml-auto">
          <Button type="primary" onClick={() => handleCreateEdit()}>
            Nueva Empresa
          </Button>
        </div>
      </div>
      <Table
        columns={getColumns()}
        loading={loading}
        dataSource={data}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        rowKey="id"
      />
      <Modal
        title={editingEmpresa ? `Editar Empresa ${selectedEmpresaId ?? ""}` : "Nueva Empresa"}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
      >
        <EmpresaForm
          initialValues={editingEmpresa || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelModal}
          loading={formLoading}
        />
      </Modal>
    </>
  )
}

export default GestionEmpresa;

