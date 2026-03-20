import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'

const WORKOUTS = [
  { id:1, name:'Beginner Full Body',  goal:'General Fitness', days:'5 days/week', level:'Beginner',     icon:'💪', color:'bg-emerald-50 text-emerald-700', members:45, exercises:['Squats 3×15','Push-ups 3×12','Dumbbell Row 3×12','Plank 3×30s','Cardio 20 min'] },
  { id:2, name:'Weight Loss Blast',   goal:'Weight Loss',     days:'6 days/week', level:'Intermediate', icon:'🔥', color:'bg-red-50 text-red-700',         members:78, exercises:['HIIT 30 min','Jump Rope 15 min','Burpees 4×15','Mountain Climbers 3×20','Circuit Training'] },
  { id:3, name:'Muscle Builder Pro',  goal:'Muscle Gain',     days:'5 days/week', level:'Advanced',     icon:'🏋️', color:'bg-blue-50 text-blue-700',       members:62, exercises:['Bench Press 4×8','Deadlifts 4×6','Squats 4×8','Pull-ups 4×8','OHP 4×8'] },
  { id:4, name:'Yoga & Flexibility',  goal:'Flexibility',     days:'7 days/week', level:'All Levels',   icon:'🧘', color:'bg-violet-50 text-violet-700',   members:34, exercises:['Sun Salutation','Warrior Pose','Triangle Pose','Child Pose','Meditation 15 min'] },
  { id:5, name:'Cardio Endurance',    goal:'Endurance',       days:'5 days/week', level:'Intermediate', icon:'🏃', color:'bg-orange-50 text-orange-700',   members:29, exercises:['Running 45 min','Cycling 30 min','Swimming','Jump Rope 15 min','Rowing 20 min'] },
  { id:6, name:'Senior Wellness',     goal:'Health',          days:'4 days/week', level:'Beginner',     icon:'🌟', color:'bg-cyan-50 text-cyan-700',       members:22, exercises:['Walking 30 min','Chair Exercises','Light Stretching','Balance Training','Breathing'] },
]

const DIETS = [
  { id:1, name:'Weight Loss Diet',  cal:'1500 kcal', protein:'120g', goal:'Weight Loss',  icon:'🥗', color:'bg-red-50 text-red-700',         meals:['Breakfast: Oats + Eggs + Fruits','Lunch: Salad + Grilled Chicken + Rice','Snack: Fruits + Nuts','Dinner: Dal + Roti + Sabzi + Salad'] },
  { id:2, name:'Muscle Gain Diet',  cal:'2800 kcal', protein:'180g', goal:'Muscle Gain',  icon:'🍗', color:'bg-blue-50 text-blue-700',        meals:['Breakfast: 6 Eggs + Oats + Banana + Milk','Lunch: Rice + Paneer + Dal + Curd','Pre-workout: Banana + Peanut Butter','Dinner: Chicken + Rice + Vegetables'] },
  { id:3, name:'Veg Balanced Diet', cal:'2000 kcal', protein:'80g',  goal:'Maintenance', icon:'🌿', color:'bg-emerald-50 text-emerald-700',  meals:['Breakfast: Poha + Sprouts + Tea','Lunch: Dal + 2 Roti + Sabzi + Salad','Snack: Yogurt + Fruits + Nuts','Dinner: Khichdi + Buttermilk + Salad'] },
]

const ASSIGNED = [
  { member:'Arjun Sharma',  workout:'Muscle Builder Pro', diet:'Muscle Gain Diet',  trainer:'Suresh Trainer', date:'Mar 01' },
  { member:'Priya Patel',   workout:'Weight Loss Blast',  diet:'Weight Loss Diet',  trainer:'Suresh Trainer', date:'Mar 05' },
  { member:'Sunita Rao',    workout:'Yoga & Flexibility', diet:'Veg Balanced Diet', trainer:'Raj Instructor',  date:'Mar 07' },
  { member:'Vikram Singh',  workout:'Muscle Builder Pro', diet:'Muscle Gain Diet',  trainer:'Suresh Trainer', date:'Mar 10' },
  { member:'Ananya Gupta',  workout:'Beginner Full Body', diet:'Veg Balanced Diet', trainer:'Suresh Trainer', date:'Mar 12' },
]

export default function WorkoutPlans() {
  const { show }    = useToast()
  const [tab, setTab]           = useState('workout')
  const [assignOpen, setAssignOpen] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [assignMember, setAssignMember] = useState('')

  function doAssign(planName) {
    if (!assignMember.trim()) { show('Please enter member name', 'error'); return }
    show(`"${planName}" assigned to ${assignMember}!`, 'success')
    setAssignOpen(null); setAssignMember('')
  }

  const TABS = [
    { key:'workout',  label:'💪 Workout Plans' },
    { key:'diet',     label:'🥗 Diet Charts' },
    { key:'assigned', label:'👤 Assigned Members' },
  ]

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout & Diet Plans</h1>
          <p className="page-subtitle">{WORKOUTS.length} workout plans · {DIETS.length} diet charts</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Workout Plans Grid */}
      {tab === 'workout' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKOUTS.map(p => (
            <div key={p.id} className="card card-body hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${p.color}`}>{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.goal}</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="badge badge-green">{p.days}</span>
                <span className="badge badge-blue">{p.level}</span>
              </div>
              <div className="space-y-1.5 mb-4">
                {p.exercises.map(e => (
                  <div key={e} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">• {e}</div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">👥 {p.members} members</span>
                <button onClick={() => setAssignOpen(p)} className="btn btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100">
                  Assign to Member
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diet Charts Grid */}
      {tab === 'diet' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIETS.map(d => (
            <div key={d.id} className="card card-body hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${d.color}`}>{d.icon}</div>
                <div>
                  <div className="font-heading font-bold text-gray-900">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.goal}</div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="badge badge-green">🔥 {d.cal}</span>
                <span className="badge badge-blue">💪 Protein {d.protein}</span>
              </div>
              <div className="space-y-1.5 mb-5">
                {d.meals.map(m => (
                  <div key={m} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">• {m}</div>
                ))}
              </div>
              <button onClick={() => setAssignOpen(d)} className="btn-primary w-full justify-center text-sm">
                Assign to Member
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assigned Members Table */}
      {tab === 'assigned' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Member</th><th>Workout Plan</th><th>Diet Chart</th><th>Trainer</th><th>Assigned On</th><th>Actions</th></tr></thead>
              <tbody>
                {ASSIGNED.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={a.member} size={8} />
                        <span className="font-semibold text-gray-900">{a.member}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{a.workout}</span></td>
                    <td><span className="badge badge-green">{a.diet}</span></td>
                    <td className="text-gray-600 text-sm">{a.trainer}</td>
                    <td className="text-gray-400 text-xs">{a.date}, 2025</td>
                    <td>
                      <button onClick={() => show(`${a.member}'s plan sent via WhatsApp`, 'success')}
                        className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100">Send Plan</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal open={!!assignOpen} onClose={() => { setAssignOpen(null); setAssignMember('') }} title={`Assign: ${assignOpen?.name}`} size="sm">
        <div className="modal-body space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            Assigning <strong>{assignOpen?.name}</strong> to a member
          </div>
          <div>
            <label className="input-label">Member Name *</label>
            <input value={assignMember} onChange={e => setAssignMember(e.target.value)}
              className="input" placeholder="Type member name..." />
          </div>
          <div>
            <label className="input-label">Start Date</label>
            <input type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => { setAssignOpen(null); setAssignMember('') }} className="btn-secondary">Cancel</button>
          <button onClick={() => doAssign(assignOpen?.name)} className="btn-primary">Assign Plan</button>
        </div>
      </Modal>

      {/* Create Plan Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Plan">
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Plan Name *</label><input className="input" placeholder="e.g. Advanced Strength" /></div>
            <div><label className="input-label">Type</label><select className="select"><option>Workout</option><option>Diet</option></select></div>
            <div><label className="input-label">Goal</label><select className="select"><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option><option>Endurance</option></select></div>
            <div><label className="input-label">Duration</label><select className="select"><option>4 weeks</option><option>8 weeks</option><option>12 weeks</option></select></div>
            <div><label className="input-label">Level</label><select className="select"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
            <div><label className="input-label">Days/Week</label><select className="select"><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></div>
          </div>
          <div><label className="input-label">Description</label><textarea className="textarea" rows={3} placeholder="Plan overview and instructions..." /></div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => { show('Plan created successfully!', 'success'); setCreateOpen(false) }} className="btn-primary">Create Plan</button>
        </div>
      </Modal>
    </div>
  )
}
