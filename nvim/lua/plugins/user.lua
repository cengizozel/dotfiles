return {
  {
    "ibhagwan/fzf-lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    opts = {},
  },
  { "ThePrimeagen/vim-be-good" },
  {
    "folke/snacks.nvim",
    opts = {
      scroll = { enabled = false },
      picker = {
        sources = {
          projects = {
            dev = { "~/Documents/GitHub" },
          },
          explorer = {
            layout = { layout = { width = 25 } }, -- default is 40
          },
        },
      },
    },
  },
}
