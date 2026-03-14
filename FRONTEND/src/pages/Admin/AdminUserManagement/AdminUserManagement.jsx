import { useState, useEffect } from "react";
import "./AdminUserManagement.css";

const USERS = [
  { id:1, name:"Arjun Sharma",    email:"arjun.sharma@college.edu",    role:"student",   dept:"CSE",  status:"active",   joined:"Jan 2024", gpa:"8.7", avatar:"AS", ac:"indigo" },
  { id:2, name:"Priya Nair",      email:"priya.nair@college.edu",      role:"faculty",   dept:"ECE",  status:"active",   joined:"Aug 2022", gpa:"—",   avatar:"PN", ac:"teal"   },
  { id:3, name:"Rahul Verma",     email:"rahul.verma@college.edu",     role:"student",   dept:"MECH", status:"inactive", joined:"Jan 2023", gpa:"6.2", avatar:"RV", ac:"violet" },
  { id:4, name:"Sneha Reddy",     email:"sneha.reddy@college.edu",     role:"placement", dept:"MBA",  status:"active",   joined:"Jun 2023", gpa:"—",   avatar:"SR", ac:"amber"  },
  { id:5, name:"Karthik M",       email:"karthik.m@college.edu",       role:"student",   dept:"CSE",  status:"active",   joined:"Jan 2024", gpa:"9.1", avatar:"KM", ac:"rose"   },
  { id:6, name:"Dr. Meena Iyer",  email:"meena.iyer@college.edu",      role:"faculty",   dept:"CSE",  status:"active",   joined:"Mar 2019", gpa:"—",   avatar:"MI", ac:"teal"   },
  { id:7, name:"Ananya Singh",    email:"ananya.singh@college.edu",    role:"student",   dept:"EEE",  status:"pending",  joined:"Jan 2024", gpa:"7.8", avatar:"AS", ac:"indigo" },
  { id:8, name:"Vikram Patel",    email:"vikram.patel@college.edu",    role:"admin",     dept:"—",    status:"active",   joined:"Sep 2021", gpa:"—",   avatar:"VP", ac:"rose"   },
  { id:9, name:"Divya Krishnan",  email:"divya.k@college.edu",         role:"student",   dept:"IT",   status:"active",   joined:"Jan 2024", gpa:"8.4", avatar:"DK", ac:"violet" },
  { id:10,name:"Prof. Raj Kumar", email:"raj.kumar@college.edu",       role:"faculty",   dept:"MECH", status:"inactive", joined:"Jul 2018", gpa:"—",   avatar:"RK", ac:"amber"  },
];

const ROLE_COLORS = { student:"role-student", faculty:"role-faculty", admin:"role-admin", placement:"role-placement" };
const STATUS_COLORS = { active:"status-active", inactive:"status-inactive", pending:"status-pending" };

export default function AdminUserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name:"", email:"", role:"student", dept:"CSE" });
  const PER_PAGE = 6;

  const filtered = USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const toggleAll = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(u=>u.id));

  const stats = {
    total: USERS.length,
    students: USERS.filter(u=>u.role==="student").length,
    faculty: USERS.filter(u=>u.role==="faculty").length,
    active: USERS.filter(u=>u.status==="active").length,
  };

  return (
    <div className="um-root">
      {/* Header */}
      <div className="um-header">
        <div>
          <div className="um-breadcrumb">Management → User Management</div>
          <h1 className="um-title">User <em>Management</em></h1>
          <p className="um-sub">Manage all users, roles, and access across the platform</p>
        </div>
        <div className="um-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={()=>{}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="btn btn-solid btn-sm" onClick={()=>setShowAddModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="um-stat-row">
        {[
          { label:"Total Users", val:stats.total, color:"indigo", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label:"Students", val:stats.students, color:"teal", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
          { label:"Faculty", val:stats.faculty, color:"violet", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
          { label:"Active Now", val:stats.active, color:"amber", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
        ].map(s => (
          <div key={s.label} className={`um-stat sc-${s.color}`}>
            <div className="um-stat-ic">{s.icon}</div>
            <div>
              <div className="um-stat-val">{s.val}</div>
              <div className="um-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-ttl">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            All Users
            <span>{filtered.length} records</span>
          </div>
          {selected.length > 0 && (
            <div className="um-bulk-actions">
              <span className="um-bulk-count">{selected.length} selected</span>
              <button className="btn btn-ghost btn-sm">Deactivate</button>
              <button className="btn btn-rose btn-sm">Delete</button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="um-filters">
          <div className="filter-search-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="filter-input um-search"
              placeholder="Search users..."
              value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1);}}
            />
          </div>
          <select className="filter-select" value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1);}}>
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
            <option value="placement">Placement</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="um-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th style={{width:40}}>
                  <input type="checkbox" className="um-check" checked={selected.length===paginated.length && paginated.length>0} onChange={toggleAll}/>
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th>GPA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id} className={selected.includes(u.id)?"um-selected":""}>
                  <td>
                    <input type="checkbox" className="um-check" checked={selected.includes(u.id)} onChange={()=>toggleSelect(u.id)}/>
                  </td>
                  <td>
                    <div className="ut-user">
                      <div className={`ut-av ut-av-${u.ac}`}>{u.avatar}</div>
                      <div>
                        <div className="ut-name">{u.name}</div>
                        <div className="ut-mail">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`role-tag ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                  <td style={{color:"var(--text2)",fontSize:12}}>{u.dept}</td>
                  <td>
                    <span className={`status-tag ${STATUS_COLORS[u.status]}`}>
                      <span className="status-dot"/>
                      {u.status}
                    </span>
                  </td>
                  <td style={{color:"var(--text3)",fontSize:11}}>{u.joined}</td>
                  <td style={{fontSize:12,fontWeight:600,color:u.gpa!=="—"?"var(--indigo-ll)":"var(--text3)"}}>{u.gpa}</td>
                  <td>
                    <div style={{display:"flex",gap:5}}>
                      <button className="ut-action" onClick={()=>setModal(u)} title="View">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="ut-action" title="Edit">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="ut-action ut-action-danger" title="Delete">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="um-footer">
          <span className="um-count">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}</span>
          <div className="pagination">
            <button className={`pg-btn ${page===1?"disabled":""}`} onClick={()=>setPage(p=>Math.max(1,p-1))}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} className={`pg-btn ${p===page?"active":""}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button className={`pg-btn ${page===pages?"disabled":""}`} onClick={()=>setPage(p=>Math.min(pages,p+1))}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {modal && (
        <div className="um-modal-bg" onClick={()=>setModal(null)}>
          <div className="um-modal" onClick={e=>e.stopPropagation()}>
            <div className="um-modal-hd">
              <div className={`um-modal-av ut-av-${modal.ac}`}>{modal.avatar}</div>
              <div>
                <div className="um-modal-name">{modal.name}</div>
                <div className="um-modal-email">{modal.email}</div>
              </div>
              <button className="um-modal-close" onClick={()=>setModal(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-modal-row"><span>Role</span><span className={`role-tag ${ROLE_COLORS[modal.role]}`}>{modal.role}</span></div>
              <div className="um-modal-row"><span>Department</span><span>{modal.dept}</span></div>
              <div className="um-modal-row"><span>Status</span><span className={`status-tag ${STATUS_COLORS[modal.status]}`}><span className="status-dot"/>{modal.status}</span></div>
              <div className="um-modal-row"><span>Joined</span><span>{modal.joined}</span></div>
              {modal.gpa !== "—" && <div className="um-modal-row"><span>GPA</span><span style={{color:"var(--indigo-ll)",fontWeight:700}}>{modal.gpa}</span></div>}
            </div>
            <div className="um-modal-ft">
              <button className="btn btn-ghost btn-sm">Reset Password</button>
              <button className="btn btn-solid btn-sm">Edit Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="um-modal-bg" onClick={()=>setShowAddModal(false)}>
          <div className="um-modal" onClick={e=>e.stopPropagation()}>
            <div className="um-modal-hd" style={{borderBottom:"1px solid var(--border)",paddingBottom:16,marginBottom:0}}>
              <div style={{fontWeight:700,fontSize:15}}>Add New User</div>
              <button className="um-modal-close" onClick={()=>setShowAddModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-group">
                <label>Full Name</label>
                <input className="filter-input" style={{width:"100%"}} placeholder="Enter full name" value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})}/>
              </div>
              <div className="um-form-group">
                <label>Email</label>
                <input className="filter-input" style={{width:"100%"}} placeholder="user@college.edu" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})}/>
              </div>
              <div className="um-form-row">
                <div className="um-form-group" style={{flex:1}}>
                  <label>Role</label>
                  <select className="filter-select" style={{width:"100%"}} value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                    <option value="placement">Placement</option>
                  </select>
                </div>
                <div className="um-form-group" style={{flex:1}}>
                  <label>Department</label>
                  <select className="filter-select" style={{width:"100%"}} value={newUser.dept} onChange={e=>setNewUser({...newUser,dept:e.target.value})}>
                    <option>CSE</option><option>ECE</option><option>MECH</option><option>EEE</option><option>IT</option><option>MBA</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="um-modal-ft">
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-solid btn-sm" onClick={()=>setShowAddModal(false)}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}