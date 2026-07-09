return {
  {
    "ibhagwan/fzf-lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    opts = {},
  },
  { "ThePrimeagen/vim-be-good" },
  {
    "nvim-neo-tree/neo-tree.nvim",
    opts = {
      filesystem = {
        hijack_netrw_behavior = "open_current",
      },
      window = {
        width = 25, -- default is 40
      },
    },
  },
  {
    "folke/snacks.nvim",
    opts = {
      picker = {
        sources = {
          projects = {
            dev = { "~/Documents/GitHub" },
          },
        },
      },
    },
  },
}
