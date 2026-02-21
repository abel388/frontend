'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    documentType: '',
    documentNumber: '',
    email: '',
    phone: '',
    country: '',
    birthDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.documentType || !formData.documentNumber || !formData.email || !formData.phone || !formData.country || !formData.birthDate) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          birthDate: formData.birthDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error al registrar el cliente');
        return;
      }

      setSuccess(true);
      setFormData({
        name: '',
        documentType: '',
        documentNumber: '',
        email: '',
        phone: '',
        country: '',
        birthDate: '',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Registro de Cliente</h1>
        <p className="text-gray-600 text-center mb-6">Por favor, completa tu información</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ ¡Registro exitoso! Redirigiendo...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* País */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              País de Origen
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un país</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="España">España</option>
              <option value="Argentina">Argentina</option>
              <option value="Perú">Perú</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Chile">Chile</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Tipo de Documento */}
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Identificación
            </label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona el tipo</option>
              {formData.country === 'Colombia' && (
                <>
                  <option value="Cédula">Cédula de Ciudadanía</option>
                  <option value="Pasaporte">Pasaporte</option>
                </>
              )}
              {formData.country === 'México' && (
                <>
                  <option value="RFC">RFC</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="INE">INE</option>
                </>
              )}
              {formData.country === 'España' && (
                <>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                </>
              )}
              {formData.country === 'Argentina' && (
                <>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                </>
              )}
              {formData.country === 'Estados Unidos' && (
                <>
                  <option value="SSN">Social Security Number</option>
                  <option value="Licencia">Driver License</option>
                  <option value="Pasaporte">Pasaporte</option>
                </>
              )}
              {!['Colombia', 'México', 'España', 'Argentina', 'Estados Unidos'].includes(formData.country) && (
                <>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Cédula">Cédula</option>
                  <option value="DNI">DNI</option>
                  <option value="RFC">RFC</option>
                  <option value="Otro">Otro</option>
                </>
              )}
            </select>
          </div>

          {/* Número de Documento */}
          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de {formData.documentType || 'Identificación'}
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Ingresa tu número de identificación"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+57 3001234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Cumpleaños */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <a href="/auth/signin" className="text-indigo-600 hover:underline">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}
