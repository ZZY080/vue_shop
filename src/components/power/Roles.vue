<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="rolelist" :border="true" :strip="true">
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                            v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag :closable="true" @close="removeRightById(scope.row, item1.id)"> {{
                                        item1.authName
                                }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                                    v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" :closable="true"
                                            @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id"
                                            :closable="true" @close="removeRightById(scope.row, item3.id)">
                                            {{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName">
                </el-table-column>
                <el-table-column label="角色描述" prop="roleDesc">
                </el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">
                            编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                            @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加用户角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
            <!-- 内容主体区域 ref是表单的应用在重置表单时有用 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>

            </el-form>

            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色对话框 -->
        <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 ref是表单的应用在重置表单时有用 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightslist" :props="treeProps" :show-checkbox="true" node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import { async } from 'q'

export default {
    data: function () {
        return {
            // 所有角色列表数据
            rolelist: [],
            // 控制用户对话框的显示与隐藏
            addDialogVisible: false,
            //添加角色的表单数据
            addForm: {
                roleName: '',
                roleDesc: '',
            },
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称长度在3-10个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色名称描述', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称描述长度在3-10个字符之间', trigger: 'blur' }
                ]
            },
            // 控制修改角色的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm: {

            },
            editFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称长度在3-10个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色名称描述', trigger: 'blur' },
                    { min: 3, max: 10, message: '角色名称描述长度在3-10个字符之间', trigger: 'blur' }
                ]
            },
            // 控制分配权限对话的显示与隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightslist:[],
            // 树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children',
            },
            // 默认选中的节点Id值数组
            defKeys:[],
            // 当前即将分配权限的角色id
            roleId:''

        }
    },
    created: function () {
        this.getRolesList()
    },
    methods: {
        // 获取所有角色的列表
        getRolesList: async function () {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.rolelist = res.data
        },
        // 根据Id删除对应的权限
        removeRightById: async function (role, rightId) {
            // 弹框提示用户是否要删除
            const confirmResult = await this.$confirm('此操作将永久删除文件，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if (confirmResult !== 'confirm') {
                return this.$message.info('取消了删除！')
            }
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败！')
            }
            // this.getRolesList()  不能重新获取权限数据否则删除后会刷新列表
            // console.log(res.data) 角色对应的权限
            role.children = res.data


        },
        // 点击确认按钮添加 角色
        addRole: function () {
            // 先进行预验证 refs为表单的引用 可以获取表单的属性
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                // 可以发起添加角色用户的网络请求
                const { data: res } = await this.$http.post('roles', this.addForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加角色失败！')
                }
                this.$message.success('添加角色成功！')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                // 重新获取列表数据
                this.getRolesList()

            })
        },
        // 展示编辑角色的对话框
        showEditDialog: async function (id) {
            //    console.log(id)
            const { data: res } = await this.$http.get('roles/' + id)
            if (res.meta.status !== 200) {

            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听修改角色对话框的关闭事件
        editDialogClosed: function () {
            this.$refs.editFormRef.resetFields()
        },
        // 修改角色信息并提交
        editRoleInfo: function () {
            // 进行预验证 如果通过预验证则valid为true
            this.$refs.editFormRef.validate(async valid => {
                // 验证失败
                if (!valid) return
                // 发起修改用户信息的数据请求
                const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc
                })
                if (res.meta.status !== 200) {
                    return this.message.eror('更新用户信息失败！')
                }
                // 关闭对话框
                this.editDialogVisible = false
                // 刷新数据列表
                this.getRolesList()
                // 提示修改成功
                this.$message.success('更新用户信息成功！')
            })

        },
        // 根据Id删除对应的用户信息
        removeRoleById: async function (id) {
            // console.log(id)
            // 弹出询问用户是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除改角色，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).catch(err => err)

            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancel
            // console.log(confirmRsult)  info 可以写也可以不写
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('roles/' + id)
            if (res.meta.status !== 200) {
                return this.$message.success('删除用户成功！')
            }
            this.$message.success('删除用户成功！')
            this.getRolesList();
        },
        // 展示分配权限的对话框
        showSetRightDialog:async function (role) {
            this.roleId=role.id
            // 获取所有权限的数据
            const {data:res}=await this.$http.get('rights/tree')
            console.log(res)
            if(res.meta.status!==200) {
                return this.$message.error('获取权限数据失败！')
            }
            this.rightslist=res.data

            // 递归获取三级节点的Id
            this.getLeafKeys(role,this.defKeys)

            this.setRightDialogVisible = true
        },
        // 通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys 数组中
        getLeafKeys:function(node,arr){
            // 如果当前 Node 节点不包含 children 属性则是三级节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item=>{
               return this.getLeafKeys(item,arr)
            })
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed:function(){
            this.defKeys=[]
        },
        // 点击为角色分配权限
        allotRights:async function(){
            const keys=[
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr=keys.join(',')
            // console.log(idStr)
            const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{
                rids:idStr
            })
            if(res.meta.status!==200) {
                return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功！')
            this.getRolesList()
            this.setRightDialogVisible=false
        }
    }

}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>