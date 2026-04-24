import React, { useState, useEffect } from 'react';
import { vehiclesApi, equipmentApi } from '../services/api';
import VehicleModal from '../components/VehicleModal';
import EquipmentModal from '../components/EquipmentModal';
import { toast } from 'react-toastify';

const VehiclesEquipment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'equipment'>('vehicles');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [v, e] = await Promise.all([vehiclesApi.getVehicles(), equipmentApi.getEquipment()]);
      setVehicles(Array.isArray(v) ? v : []);
      setEquipment(Array.isArray(e) ? e : []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehiclesApi.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => (v._id || v.id) !== id));
      toast.success('Vehicle deleted');
    } catch { toast.error('Failed to delete vehicle'); }
  };

  const handleToggleVehicle = async (vehicle: any) => {
    const id = vehicle._id || vehicle.id;
    try {
      const updated = await vehiclesApi.updateVehicle(id, { isActive: !vehicle.isActive });
      setVehicles(prev => prev.map(v => (v._id || v.id) === id ? { ...v, ...updated, isActive: !vehicle.isActive } : v));
      toast.success(`Vehicle ${!vehicle.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update vehicle'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles & Equipment</h1>
        <button
          onClick={() => activeTab === 'vehicles' ? (setSelectedVehicle(null), setShowVehicleModal(true)) : setShowEquipmentModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          + Add {activeTab === 'vehicles' ? 'Vehicle' : 'Equipment'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {(['vehicles', 'equipment'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-900'}`}>
            {tab} ({tab === 'vehicles' ? vehicles.length : equipment.length})
          </button>
        ))}
      </div>

      {activeTab === 'vehicles' ? (
        vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🚑</p>
            <p className="text-gray-600 mb-4">No vehicles added yet</p>
            <button onClick={() => { setSelectedVehicle(null); setShowVehicleModal(true); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v: any) => {
              const id = v._id || v.id;
              return (
                <div key={id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                    <span className="text-5xl">🚑</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{v.vehicleNumber}</h3>
                        <p className="text-sm text-gray-500 capitalize">{(v.vehicleType || '').replace(/_/g, ' ')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>Capacity: {v.capacity || 'N/A'} persons</p>
                      {v.equipment?.length > 0 && (
                        <p>Equipment: {v.equipment.slice(0, 2).join(', ')}{v.equipment.length > 2 ? ` +${v.equipment.length - 2} more` : ''}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedVehicle(v); setShowVehicleModal(true); }}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleToggleVehicle(v)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${v.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                        {v.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDeleteVehicle(id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        equipment.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🏥</p>
            <p className="text-gray-600 mb-4">No equipment added yet</p>
            <button onClick={() => setShowEquipmentModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Add Equipment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Vehicle', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {equipment.map((item: any, i: number) => (
                  <tr key={item.id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vehicles.find(v => (v._id || v.id) === item.vehicleId)?.vehicleNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{item.status || 'operational'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showVehicleModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleModal(false)}
          onSave={(v) => {
            if (selectedVehicle) {
              setVehicles(prev => prev.map(x => (x._id || x.id) === (selectedVehicle._id || selectedVehicle.id) ? { ...x, ...v } : x));
            } else {
              setVehicles(prev => [...prev, v]);
            }
            setShowVehicleModal(false);
          }}
        />
      )}

      {showEquipmentModal && (
        <EquipmentModal
          equipment={null}
          vehicles={vehicles}
          onClose={() => setShowEquipmentModal(false)}
          onSave={(item) => {
            setEquipment(prev => [...prev, item]);
            setShowEquipmentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default VehiclesEquipment;
