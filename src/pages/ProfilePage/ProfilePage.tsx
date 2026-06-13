import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, AlertTriangle, Heart, Activity, Edit2, Save, X, Calendar } from 'lucide-react';
import { usePetStore } from '../../stores';
import { Temperament } from '../../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentPet, updatePet } = usePetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPet, setEditedPet] = useState(currentPet);

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">暂无宠物档案</p>
      </div>
    );
  }

  const handleSave = () => {
    if (editedPet) {
      updatePet(currentPet.id, editedPet);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedPet(currentPet);
    setIsEditing(false);
  };

  const temperamentOptions = Object.values(Temperament);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">宠物档案</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {currentPet.avatar ? (
              <img src={currentPet.avatar} alt={currentPet.name} className="w-full h-full object-cover" />
            ) : (
              <Dog className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedPet?.name || ''}
                onChange={(e) => setEditedPet({ ...editedPet!, name: e.target.value })}
                className="text-2xl font-bold bg-white/20 text-white px-3 py-1 rounded-lg border-2 border-white/30 focus:outline-none focus:border-white"
              />
            ) : (
              <h2 className="text-2xl font-bold">{currentPet.name}</h2>
            )}
            <p className="text-white/80">{currentPet.breed} · {currentPet.age}岁</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Dog className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text-primary">基本信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-secondary">品种</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPet?.breed || ''}
                  onChange={(e) => setEditedPet({ ...editedPet!, breed: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
                />
              ) : (
                <p className="text-sm font-medium">{currentPet.breed}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">年龄</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedPet?.age || 0}
                  onChange={(e) => setEditedPet({ ...editedPet!, age: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
                />
              ) : (
                <p className="text-sm font-medium">{currentPet.age}岁</p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">体重</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedPet?.weight || 0}
                  onChange={(e) => setEditedPet({ ...editedPet!, weight: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
                />
              ) : (
                <p className="text-sm font-medium">{currentPet.weight}kg</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-text-primary">性格特征</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              temperamentOptions.map((temp) => (
                <label key={temp} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editedPet?.temperament.includes(temp) || false}
                    onChange={(e) => {
                      const newTemperament = e.target.checked
                        ? [...(editedPet?.temperament || []), temp]
                        : (editedPet?.temperament || []).filter(t => t !== temp);
                      setEditedPet({ ...editedPet!, temperament: newTemperament });
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{temp}</span>
                </label>
              ))
            ) : (
              currentPet.temperament.map((temp) => (
                <span
                  key={temp}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                >
                  {temp}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-text-primary">禁忌事项</h3>
          </div>
          {currentPet.contraindications.length > 0 ? (
            <ul className="space-y-2">
              {currentPet.contraindications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"></span>
                  <span className="text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">暂无禁忌事项</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-text-primary">过敏信息</h3>
          </div>
          {currentPet.allergies.length > 0 ? (
            <ul className="space-y-2">
              {currentPet.allergies.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span>
                  <span className="text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">暂无过敏信息</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-text-primary">既往问题</h3>
          </div>
          {currentPet.pastProblems.length > 0 ? (
            <div className="space-y-3">
              {currentPet.pastProblems.map((problem, index) => (
                <div key={index} className="border-l-2 border-accent/30 pl-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{problem.behavior}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      problem.status === 'improved' ? 'bg-secondary/10 text-secondary' :
                      problem.status === 'improving' ? 'bg-accent/10 text-accent' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {problem.status === 'improved' ? '已改善' :
                       problem.status === 'improving' ? '改善中' : '持续'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{problem.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">暂无既往问题</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-text-primary">健康备注</h3>
          </div>
          {isEditing ? (
            <textarea
              value={editedPet?.healthNotes || ''}
              onChange={(e) => setEditedPet({ ...editedPet!, healthNotes: e.target.value })}
              className="w-full px-2 py-1 border border-gray-200 rounded mt-1 focus:outline-none focus:border-primary"
              rows={3}
            />
          ) : (
            <p className="text-sm text-text-secondary">
              {currentPet.healthNotes || '暂无健康备注'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-3">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/booking')}
              className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition"
            >
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent">预约课程</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
