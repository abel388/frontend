'use client';
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio"];

const DATA_BY_MES = {
  enero: {
    propina: 14500000,
    ventasTotales: 28000000,
    sinImpuestos: 24000000,
    precioPromedio: 32000,
    meseroTop: { nombre: "RUDIN", valor: 5200000 },
    meseros: [
      { nombre: "RUDIN", ventas: 5200000 },
      { nombre: "LUIS", ventas: 4800000 },
      { nombre: "HENRY", ventas: 3900000 },
      { nombre: "ED", ventas: 3500000 },
      { nombre: "JHON", ventas: 3100000 },
      { nombre: "LEONARDO", ventas: 2900000 },
      { nombre: "ISACC", ventas: 2600000 },
      { nombre: "BRAYAN", ventas: 2200000 },
      { nombre: "CARLOS", ventas: 1800000 },
      { nombre: "CAMILO", ventas: 1500000 },
    ],
    productoTop: { nombre: "PARRILLADA MIXTA PARA 2 PERSONAS", uds: 35, precio: 71934, total: 2517690 },
    ventasDia: [
      { dia: "1", ventas: 900000 }, { dia: "5", ventas: 1200000 }, { dia: "10", ventas: 980000 },
      { dia: "15", ventas: 1500000 }, { dia: "20", ventas: 1100000 }, { dia: "25", ventas: 1800000 }, { dia: "31", ventas: 2100000 },
    ],
    categorias: [
      { name: "ALIMENTO", value: 55, color: "#e8b84b" },
      { name: "BEBIDA", value: 30, color: "#4b9fe8" },
      { name: "SERVICIOS", value: 15, color: "#4be8a0" },
    ],
  },
  febrero: {
    propina: 18000000,
    ventasTotales: 36000000,
    sinImpuestos: 31000000,
    precioPromedio: 36820,
    meseroTop: { nombre: "LUIS", valor: 6714800 },
    meseros: [
      { nombre: "LUIS", ventas: 6714800 },
      { nombre: "RUDIN", ventas: 4100000 },
      { nombre: "HENRY", ventas: 3600000 },
      { nombre: "ED", ventas: 3300000 },
      { nombre: "JHON", ventas: 2900000 },
      { nombre: "LEONARDO", ventas: 2800000 },
      { nombre: "ISACC", ventas: 2500000 },
      { nombre: "BRAYAN", ventas: 2100000 },
      { nombre: "CARLOS", ventas: 1600000 },
      { nombre: "CAMILO", ventas: 1400000 },
      { nombre: "YEINER", ventas: 1200000 },
      { nombre: "COMERCIAL", ventas: 900000 },
      { nombre: "GABRIEL", ventas: 700000 },
    ],
    productoTop: { nombre: "PARRILLADA MIXTA PARA 2 PERSONAS", uds: 39, precio: 71934, total: 3432000 },
    ventasDia: [
      { dia: "1", ventas: 800000 }, { dia: "5", ventas: 1400000 }, { dia: "10", ventas: 1100000 },
      { dia: "14", ventas: 3200000 }, { dia: "17", ventas: 1800000 }, { dia: "21", ventas: 2400000 }, { dia: "28", ventas: 2900000 },
    ],
    categorias: [
      { name: "ALIMENTO", value: 58, color: "#e8b84b" },
      { name: "BEBIDA", value: 28, color: "#4b9fe8" },
      { name: "SERVICIOS", value: 14, color: "#4be8a0" },
    ],
  },
  marzo: {
    propina: 16000000,
    ventasTotales: 31000000,
    sinImpuestos: 27000000,
    precioPromedio: 34000,
    meseroTop: { nombre: "HENRY", valor: 5900000 },
    meseros: [
      { nombre: "HENRY", ventas: 5900000 },
      { nombre: "LUIS", ventas: 5100000 },
      { nombre: "RUDIN", ventas: 4300000 },
      { nombre: "ED", ventas: 3200000 },
      { nombre: "JHON", ventas: 2700000 },
      { nombre: "LEONARDO", ventas: 2400000 },
      { nombre: "ISACC", ventas: 2100000 },
      { nombre: "BRAYAN", ventas: 1900000 },
      { nombre: "CARLOS", ventas: 1500000 },
    ],
    productoTop: { nombre: "PARRILLADA ESPECIAL 3 PERSONAS", uds: 42, precio: 85000, total: 3570000 },
    ventasDia: [
      { dia: "1", ventas: 950000 }, { dia: "7", ventas: 1300000 }, { dia: "14", ventas: 1700000 },
      { dia: "20", ventas: 1200000 }, { dia: "25", ventas: 2100000 }, { dia: "31", ventas: 2500000 },
    ],
    categorias: [
      { name: "ALIMENTO", value: 60, color: "#e8b84b" },
      { name: "BEBIDA", value: 25, color: "#4b9fe8" },
      { name: "SERVICIOS", value: 15, color: "#4be8a0" },
    ],
  },
};

// Rellena meses sin data con copia de febrero
MESES.forEach(m => {
  if (!DATA_BY_MES[m]) DATA_BY_MES[m] = DATA_BY_MES["febrero"];
});

const CATEGORIAS_TABS = ["ALIMENTO", "BEBIDA", "SERVICIOS"];

const fmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(0) + " mill.";
  if (n >= 1000) return (n / 1000).toFixed(0) + " mil";
  return n.toLocaleString("es-CO");
};

const fmtCOP = (n) => "$" + n.toLocaleString("es-CO");

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1e1b2e", border: "1px solid #3a3550", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ color: "#a89cc8", fontSize: 12, margin: "0 0 4px" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: "#e8d5f0", fontSize: 13, fontWeight: 600, margin: 0 }}>
            {fmtCOP(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [mesActivo, setMesActivo] = useState("febrero");
  const [categoriaActiva, setCategoriaActiva] = useState("ALIMENTO");
  const [vistaActiva, setVistaActiva] = useState("generaVenta");

  const data = DATA_BY_MES[mesActivo];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#13111f", minHeight: "100vh", color: "#e8d5f0" }}>

      {/* Top bar */}
      <div style={{ background: "#1a1728", borderBottom: "1px solid #2a2540", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setVistaActiva("generaVenta")}
          style={{
            padding: "8px 20px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: vistaActiva === "generaVenta" ? "#c0185a" : "transparent",
            color: vistaActiva === "generaVenta" ? "#fff" : "#c0185a",
            border: "2px solid #c0185a", transition: "all 0.2s"
          }}
        >
          Ver Genera Venta
        </button>
        <button
          onClick={() => setVistaActiva("reserva")}
          style={{
            padding: "8px 20px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: vistaActiva === "reserva" ? "#c0185a" : "transparent",
            color: vistaActiva === "reserva" ? "#fff" : "#c0185a",
            border: "2px solid #c0185a", transition: "all 0.2s"
          }}
        >
          Ver Reserva
        </button>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>

        {/* Main content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {vistaActiva === "generaVenta" ? (
            <>
              {/* Categoría tabs + Mesero Top */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#6a6080", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Recuento de Categoría por Categoría</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {CATEGORIAS_TABS.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoriaActiva(cat)}
                        style={{
                          padding: "8px 18px", borderRadius: 4, fontWeight: 700, fontSize: 12,
                          cursor: "pointer", letterSpacing: "0.08em",
                          background: categoriaActiva === cat ? "#2a2035" : "transparent",
                          color: categoriaActiva === cat ? "#e8d5f0" : "#6a6080",
                          border: categoriaActiva === cat ? "1px solid #4a3060" : "1px solid #2a2540",
                          transition: "all 0.2s"
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "#e8d5f0", margin: 0 }}>
                    {data.meseroTop.nombre} → {fmtCOP(data.meseroTop.valor)}
                  </p>
                  <p style={{ fontSize: 12, color: "#6a6080", margin: "4px 0 0" }}>Mesero Top por Categoría</p>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Suma de Propina", value: fmt(data.propina) },
                  { label: "Ventas Totales", value: fmt(data.ventasTotales) },
                  { label: "Suma de Valor Sin Impuestos", value: fmt(data.sinImpuestos) },
                  { label: "Precio Unitario Promedio", value: fmt(data.precioPromedio) },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "20px 24px" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#e8d5f0", margin: "0 0 6px" }}>{kpi.value}</p>
                    <p style={{ fontSize: 12, color: "#6a6080", margin: 0 }}>{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Ventas por Mesero Bar Chart */}
              <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "24px", marginBottom: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#a89cc8", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Ventas Totales por Mesero
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.meseros} margin={{ bottom: 20 }}>
                    <XAxis dataKey="nombre" tick={{ fill: "#6a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fill: "#6a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ventas" fill="#6ab0de" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Producto Top + Pie + Ventas por dia */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 28 }}>
                {/* Ventas por dia */}
                <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "24px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#a89cc8", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Ventas por Día del Mes
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.ventasDia}>
                      <XAxis dataKey="dia" tick={{ fill: "#6a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => fmt(v)} tick={{ fill: "#6a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="ventas" stroke="#c0185a" strokeWidth={2.5} dot={{ fill: "#e8b84b", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie categorias */}
                <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "24px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#a89cc8", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    % por Categoría
                  </p>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={data.categorias} cx="50%" cy="50%" innerRadius={42} outerRadius={60} dataKey="value" strokeWidth={0}>
                        {data.categorias.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => v + "%"} contentStyle={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 8, color: "#e8d5f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {data.categorias.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }}></div>
                        <span style={{ fontSize: 12, color: "#6a6080" }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#e8d5f0", fontWeight: 600 }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Producto top */}
              <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "24px" }}>
                <p style={{ fontSize: 11, color: "#6a6080", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Producto Más Vendido</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#e8d5f0", margin: "0 0 4px" }}>
                  {data.productoTop.nombre} ({data.productoTop.uds} uds) Precio: {fmtCOP(data.productoTop.precio)} Total: {fmtCOP(data.productoTop.total)}
                </p>
              </div>
            </>
          ) : (
            /* ── VISTA RESERVA ── */
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Reservas del Mes", value: "48" },
                  { label: "Mesas Ocupadas Prom.", value: "12 / día" },
                  { label: "Cancelaciones", value: "5" },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "20px 24px" }}>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#e8d5f0", margin: "0 0 6px" }}>{kpi.value}</p>
                    <p style={{ fontSize: 12, color: "#6a6080", margin: 0 }}>{kpi.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, padding: "24px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#a89cc8", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Reservas por Semana
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { semana: "Sem 1", reservas: 10 }, { semana: "Sem 2", reservas: 14 },
                    { semana: "Sem 3", reservas: 18 }, { semana: "Sem 4", reservas: 12 },
                  ]}>
                    <XAxis dataKey="semana" tick={{ fill: "#6a6080", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6a6080", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 8, color: "#e8d5f0" }} />
                    <Bar dataKey="reservas" fill="#c0185a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#1e1b2e", border: "1px solid #2a2540", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2540" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#a89cc8", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reservas Recientes</p>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2540" }}>
                      {["Cliente", "Fecha", "Hora", "Personas", "Estado"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "#6a6080", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { cliente: "Carlos Méndez", fecha: "21/02/2026", hora: "19:00", personas: 4, estado: "Confirmada", color: "#10b981" },
                      { cliente: "Laura Gómez", fecha: "21/02/2026", hora: "20:00", personas: 2, estado: "Pendiente", color: "#f59e0b" },
                      { cliente: "Andrés Torres", fecha: "21/02/2026", hora: "20:30", personas: 6, estado: "Confirmada", color: "#10b981" },
                      { cliente: "María Fernández", fecha: "22/02/2026", hora: "21:00", personas: 3, estado: "Cancelada", color: "#ef4444" },
                      { cliente: "José Ramírez", fecha: "22/02/2026", hora: "21:30", personas: 5, estado: "Confirmada", color: "#10b981" },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1728" }}>
                        <td style={{ padding: "14px 20px", fontSize: 14, color: "#e8d5f0" }}>{r.cliente}</td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#6a6080" }}>{r.fecha}</td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#e8b84b", fontWeight: 600 }}>{r.hora}</td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#6a6080", textAlign: "center" }}>{r.personas}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.color + "22", color: r.color, border: `1px solid ${r.color}44` }}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar filtro mes */}
        <div style={{ width: 180, background: "#1a1728", borderLeft: "1px solid #2a2540", padding: "28px 20px" }}>
          <p style={{ fontSize: 11, color: "#6a6080", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px", fontWeight: 700 }}>Mes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="mes" value="--" onChange={() => setMesActivo("febrero")}
                style={{ accentColor: "#c0185a" }} />
              <span style={{ fontSize: 13, color: "#6a6080" }}>--</span>
            </label>
            {MESES.map(m => (
              <label key={m} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="radio" name="mes" value={m} checked={mesActivo === m}
                  onChange={() => setMesActivo(m)} style={{ accentColor: "#c0185a" }} />
                <span style={{ fontSize: 13, color: mesActivo === m ? "#e8d5f0" : "#6a6080", fontWeight: mesActivo === m ? 600 : 400 }}>
                  {m}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
