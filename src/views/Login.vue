<script setup lang="ts">
import { ref } from "vue";
import api from "../api";

const formData = ref({
  name: "",
  email: "",
});

function onClickLogin() {
  api.user
    .login(formData.value.name)
    .then((res) => {
      api.user.setCurrentUser(res);
    })
    .catch((err) => {
      console.warn("当前用户还没有注册", err);
      api.user
        .register(formData.value.name, formData.value.email)
        .then((res) => {
          api.user.setCurrentUser(res);
        })
        .catch((err) => {
          console.error("登陆失败", err);
        });
    });
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden">
    <div class="max-w-7xl w-fit my-10 mx-auto">
      <form id="login-form" class="flex flex-col gap-2">
        <div class="flex gap-2 justify-end">
          <label for="name">名称</label>
          <input
            v-model="formData.name"
            id="name"
            class="border rounded"
            name="name"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <label for="email">电子邮箱</label>
          <input
            v-model="formData.email"
            id="email"
            class="border rounded"
            name="email"
          />
        </div>
        <div class="w-full text-right">
          <button
            class="border px-2 rounded bg-primary text-white"
            type="button"
            @click="onClickLogin"
          >
            登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
#login-form label {
  @apply text-right w-[4rem];
}

#login-form input {
  @apply w-[14rem];
}
</style>
