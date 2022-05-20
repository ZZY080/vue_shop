<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width=" isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu background-color="#323745" text-color="#fff" active-text-color="#3e9eff" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
                    <!-- 一级菜单 -->
                    <!-- 不同index决定不同菜单展开 -->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>

                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" @click="saveNavState('/'+subItem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>
                </el-menu>

            </el-aside>
            <!-- 右侧主体区域 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data:function(){
        return {
            // 左侧菜单数据
            menulist:[],
            iconsObj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            // 是否折叠
            isCollapse:false,
            // 被激活的链接地址
            activePath:''

        }
    },
    created:function(){
        this.getMenuList();
        this.activePath=window.sessionStorage.getItem('activePath');
    },
    methods: {
        logout: function () {
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        //获取所有菜单
        getMenuList:async function(){
            const {data:res}=await this.$http.get('menus');
            // console.log(res);
            if(res.meta.status!==200) return this.$message.error(res.meta.msg) ;
            this.menulist=res.data;
            return this.$message.success(res.meta.msg);
        },
        toggleCollapse:function(){
            this.isCollapse=!this.isCollapse
        },
        //保存链接的激活状态
        saveNavState:function(activePath){
            window.sessionStorage.setItem('activePath',activePath);
        }    
    }
}
</script>
<style lang="less" scoped>
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;

    >div {
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 20px;

        >img {
            width: 70px;
            height: 70px;
        }

        >span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}

.el-main {
    background-color: #EAEDF1;
}

.iconfont {
    margin-right: 10px;
}
.home-container {
    height: 100%;
}
.toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 24px;
    letter-spacing: .2em;
    cursor: pointer;
}
</style>

