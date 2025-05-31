import { useMonitoring } from '../hooks/useMonitoring';
import { useMemo, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Droplets as HumidityIcon, Thermometer as TemperatureIcon, Activity as ConductivityIcon } from 'lucide-react';

// Funciones de formato para los ejes
const formatTemperature = (value) => `${value}°C`;
const formatHumidity = (value) => `${value}%`;
const formatConductivity = (value) => `${value} mS/cm`;

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-2 border rounded shadow-lg">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-sm" style={{ color: item.color }}>
          {item.name}: {item.value}
          {item.name === 'temperatura' && '°C'}
          {item.name === 'humedad' && '%'}
          {item.name === 'conductividad' && ' mS/cm'}
        </p>
      ))}
    </div>
  );
};

export const RealTimeChart = () => {
  const {
    realTimeData,
    sensors,
    selectedCrop,
    thresholds,
    loading,
    getReadingsByCropId
  } = useMonitoring();

  const [manualReadings, setManualReadings] = useState([]);

  // Efecto para cargar las lecturas manuales
  useEffect(() => {
    if (selectedCrop?.id) {
      getReadingsByCropId(selectedCrop.id)
        .then(response => {
          setManualReadings(response.data || []);
        })
        .catch(error => {
          console.error('Error al obtener lecturas:', error);
        });
    }
  }, [selectedCrop?.id, getReadingsByCropId]);

  // Procesar datos del contexto para el gráfico
  const chartData = useMemo(() => {
    const timePoints = new Map();

    // Función para procesar una lectura
    const processReading = (reading, sensorType) => {
      const time = new Date(reading.readingDate).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (!timePoints.has(time)) {
        timePoints.set(time, { time });
      }

      const point = timePoints.get(time);

      switch (sensorType.toLowerCase()) {
        case 'temperature':
        case 'sensor temperatura':
          point.temp = reading.readingValue;
          break;
        case 'humidity':
        case 'humedad':
          point.hum = reading.readingValue;
          break;
        case 'ec':
        case 'conductividad electrica':
          point.cond = reading.readingValue;
          break;
        default:
          break;
      }
    };

    // Procesar datos en tiempo real si están disponibles
    if (realTimeData && Object.keys(realTimeData).length > 0) {
      Object.entries(realTimeData).forEach(([sensorId, sensorData]) => {
        if (sensorData.history && sensorData.history.length > 0) {
          const sensor = sensors.find(s => s.id === parseInt(sensorId));
          if (sensor) {
            sensorData.history.forEach(reading => {
              processReading(reading, sensor.type);
            });
          }
        }
      });
    }

    // Procesar lecturas manuales
    manualReadings.forEach(reading => {
      processReading(reading, reading.sensorType);
    });

    // Convertir el Map a array y ordenar por tiempo
    return Array.from(timePoints.values()).sort((a, b) => {
      return new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`);
    });
  }, [realTimeData, sensors, manualReadings]);

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Cargando datos del gráfico...</span>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay datos para mostrar
          </h3>
          <p className="text-gray-600">
            {selectedCrop ?
              'Los datos se mostrarán cuando haya lecturas disponibles.' :
              'Selecciona un cultivo para ver datos en tiempo real.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Obtener umbrales actuales
  const currentThresholds = thresholds || {};

  return (
    <div className="w-full space-y-6">
      {/* Grid para humedad y temperatura */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Humedad */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-4">
            <HumidityIcon />
            <h3 className="text-lg font-semibold text-blue-600">Humedad</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[
                    dataMin => Math.max(0, Math.floor(dataMin - 5)),
                    dataMax => Math.min(100, Math.ceil(dataMax + 5))
                  ]}
                  tickFormatter={formatHumidity}
                  stroke="#4b5563"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />

                {/* Líneas de umbral de humedad */}
                {currentThresholds.humidity && (
                  <>
                    <ReferenceLine
                      y={currentThresholds.humidity.max}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Máx', position: 'right' }}
                    />
                    <ReferenceLine
                      y={currentThresholds.humidity.min}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Mín', position: 'right' }}
                    />
                  </>
                )}

                <Line
                  type="monotone"
                  dataKey="hum"
                  name="humedad"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Temperatura */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-4">
            <TemperatureIcon />
            <h3 className="text-lg font-semibold text-red-600">Temperatura</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[
                    dataMin => Math.max(0, Math.floor(dataMin - 2)),
                    dataMax => Math.ceil(dataMax + 2)
                  ]}
                  tickFormatter={formatTemperature}
                  stroke="#4b5563"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />

                {/* Líneas de umbral de temperatura */}
                {currentThresholds.temperature && (
                  <>
                    <ReferenceLine
                      y={currentThresholds.temperature.max}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Máx', position: 'right' }}
                    />
                    <ReferenceLine
                      y={currentThresholds.temperature.min}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Mín', position: 'right' }}
                    />
                  </>
                )}

                <Line
                  type="monotone"
                  dataKey="temp"
                  name="temperatura"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfica de Conductividad - Ancho completo */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center gap-2 mb-4">
          <ConductivityIcon />
          <h3 className="text-lg font-semibold text-purple-600">Conductividad eléctrica (EC)</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[
                  dataMin => Math.max(0, Math.floor(dataMin - 0.2)),
                  dataMax => Math.ceil(dataMax + 0.2)
                ]}
                tickFormatter={formatConductivity}
                stroke="#4b5563"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />

              {/* Líneas de umbral de EC */}
              {currentThresholds.ec && (
                <>
                  <ReferenceLine
                    y={currentThresholds.ec.max}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Máx', position: 'right' }}
                  />
                  <ReferenceLine
                    y={currentThresholds.ec.min}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Mín', position: 'right' }}
                  />
                </>
              )}

              <Line
                type="monotone"
                dataKey="cond"
                name="conductividad"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Última actualización: <strong>{new Date().toLocaleTimeString('es-ES')}</strong>
        </p>
      </div>
    </div>
  );
};